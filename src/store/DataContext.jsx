import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { instruments } from "../data/seed.js";
import { api, refreshSession, storeGrant, clearTokens, getRefreshToken } from "./api.js";

/**
 * Application state, backed by the /api functions.
 *
 * Every account lives in Postgres, behind the API. The only thing this app
 * keeps in the browser is the refresh token; the access token stays in
 * memory. The instrument rail is the one exception to all of it — static
 * market copy, so it still comes from `seed.js`.
 *
 * Mutations follow one rule: call the API, then fold the returned client back
 * into local state. The server is the only source of truth.
 */

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [session, setSession] = useState(null);
  /** Status of the signed-in client's own account: Pending, Active, … */
  const [accountStatus, setAccountStatus] = useState(null);
  const [clients, setClients] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [booting, setBooting] = useState(true);

  /** Pull everything the signed-in user may see. @returns {Promise<void>} */
  const refresh = useCallback(async () => {
    const res = await api("/state");
    if (!res.ok) {
      if (res.status === 401) setSession(null);
      return;
    }
    setClients(res.data.clients ?? []);
    setAuditLog(res.data.auditLog ?? []);
    setDeposits(res.data.deposits ?? []);
  }, []);

  // On first paint the access token is gone (it only ever lived in memory),
  // so trade the stored refresh token for a new one before asking who we are.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getRefreshToken() && (await refreshSession()) && !cancelled) {
        const res = await api("/auth/me");
        if (!cancelled && res.ok && res.data.session) {
          setSession(res.data.session);
          setAccountStatus(res.data.status ?? null);
          await refresh();
        }
      }
      if (!cancelled) setBooting(false);
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ ok: boolean, error?: string, session?: object }>}
   */
  const signIn = useCallback(async (email, password) => {
    const res = await api("/auth/login", { method: "POST", body: { email, password }, auth: false });
    if (!res.ok) return { ok: false, error: res.error };
    storeGrant(res.data);
    setSession(res.data.session);
    setAccountStatus(res.data.status ?? null);
    await refresh();
    return { ok: true, session: res.data.session };
  }, [refresh]);

  /**
   * Open a new client account. It is created as Pending.
   * @param {{ name: string, email: string, password: string, currency?: string }} form
   * @returns {Promise<{ ok: boolean, error?: string, field?: string, session?: object }>}
   */
  const signUp = useCallback(async (form) => {
    const res = await api("/auth/signup", { method: "POST", body: form, auth: false });
    if (!res.ok) return { ok: false, error: res.error, field: res.field };
    storeGrant(res.data);
    setSession(res.data.session);
    setAccountStatus(res.data.status ?? "Pending");
    await refresh();
    return { ok: true, session: res.data.session };
  }, [refresh]);

  /** @returns {Promise<void>} */
  const signOut = useCallback(async () => {
    // Revoke server-side first, so the refresh token cannot outlive the click.
    await api("/auth/logout", { method: "POST", body: { refreshToken: getRefreshToken() }, auth: false });
    clearTokens();
    setSession(null);
    setAccountStatus(null);
    setClients([]);
    setAuditLog([]);
    setDeposits([]);
  }, []);

  /**
   * Fold a server response back into the client list.
   * @param {{ ok: boolean, data?: { client?: object } }} res
   */
  const absorb = useCallback(async (res) => {
    if (!res.ok) return { ok: false, error: res.error };
    const updated = res.data?.client;
    if (updated) {
      setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (session?.id === updated.id) setAccountStatus(updated.status);
    }
    // The audit trail only comes back with a full refresh; admins watch it live.
    if (session?.role === "admin") {
      const state = await api("/state");
      if (state.ok) setAuditLog(state.data.auditLog ?? []);
    }
    return { ok: true };
  }, [session]);

  const setBalances = useCallback(async (clientId, balances) =>
    absorb(await api(`/accounts/${clientId}`, { method: "PATCH", body: { balances } })), [absorb]);

  const adjustBalance = useCallback(async (clientId, key, delta) =>
    absorb(await api(`/accounts/${clientId}`, { method: "PATCH", body: { adjust: { key, delta } } })), [absorb]);

  const updateClient = useCallback(async (clientId, patch) =>
    absorb(await api(`/accounts/${clientId}`, { method: "PATCH", body: { profile: patch } })), [absorb]);

  const addTransaction = useCallback(async (clientId, tx) =>
    absorb(await api(`/accounts/${clientId}/transactions`, { method: "POST", body: tx })), [absorb]);

  const deleteTransaction = useCallback(async (clientId, txId) =>
    absorb(await api(`/accounts/${clientId}/transactions/${encodeURIComponent(txId)}`, { method: "DELETE" })),
    [absorb]);

  /**
   * Tell the desk that funds have been sent. Creates a pending row; it moves
   * no balance until an admin confirms it.
   * @param {{ amount: string | number, reference?: string }} form
   */
  const declareDeposit = useCallback(async (form) => {
    const res = await api("/deposits", { method: "POST", body: form });
    if (!res.ok) return { ok: false, error: res.error, field: res.field };
    await refresh();
    return { ok: true, deposit: res.data.deposit };
  }, [refresh]);

  /**
   * Confirm or reject a declared deposit (admin).
   * @param {string} depositId
   * @param {"Confirmed" | "Rejected"} status
   * @param {string} [note]
   */
  const settleDeposit = useCallback(async (depositId, status, note = "") => {
    const res = await api(`/deposits/${depositId}`, { method: "PATCH", body: { status, note } });
    if (!res.ok) return { ok: false, error: res.error };
    await refresh();
    return { ok: true };
  }, [refresh]);

  /** Approve a pending account. @param {string} clientId */
  const approveClient = useCallback(async (clientId) =>
    absorb(await api(`/accounts/${clientId}`, { method: "PATCH", body: { profile: { status: "Active" } } })),
    [absorb]);

  const value = useMemo(() => ({
    session,
    accountStatus,
    clients,
    auditLog,
    deposits,
    booting,
    instruments,
    getClient: (id) => clients.find((c) => c.id === id) ?? null,
    signIn,
    signUp,
    signOut,
    refresh,
    setBalances,
    adjustBalance,
    updateClient,
    addTransaction,
    deleteTransaction,
    approveClient,
    declareDeposit,
    settleDeposit,
  }), [session, accountStatus, clients, auditLog, deposits, booting, signIn, signUp, signOut, refresh,
       setBalances, adjustBalance, updateClient, addTransaction, deleteTransaction, approveClient,
       declareDeposit, settleDeposit]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

/** @returns {Record<string, any>} The store. */
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
