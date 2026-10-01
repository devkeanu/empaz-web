/**
 * Client for the Empaz API.
 *
 * The API is deployed to a different host, so a session cookie would be a
 * third-party cookie and Safari and Firefox would drop it. Auth is therefore
 * a bearer token:
 *
 *   access token   short-lived, kept in this module's memory only — never in
 *                  localStorage, so an XSS payload cannot read it back later
 *   refresh token  persisted, swapped for a new pair on boot and whenever the
 *                  access token expires mid-session
 *
 * A 401 triggers exactly one refresh-and-retry, so an expired access token is
 * invisible to the rest of the app.
 */

const BASE = String(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const REFRESH_KEY = "farverde.refresh";

/** @type {string | null} Access token, memory only. */
let accessToken = null;
/** @type {Promise<boolean> | null} De-dupes concurrent refreshes. */
let inFlightRefresh = null;

/** @param {string | null} token */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * The refresh token is the one thing that must survive a reload.
 * @returns {string | null}
 */
export function getRefreshToken() {
  try { return window.localStorage.getItem(REFRESH_KEY); } catch { return null; }
}

/** @param {string | null} token */
export function setRefreshToken(token) {
  try {
    if (token) window.localStorage.setItem(REFRESH_KEY, token);
    else window.localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* private mode — the session then lasts until the tab closes */
  }
}

/** Store both halves of a grant. @param {{accessToken: string, refreshToken: string}} grant */
export function storeGrant(grant) {
  setAccessToken(grant.accessToken ?? null);
  setRefreshToken(grant.refreshToken ?? null);
}

/** Forget everything. @returns {void} */
export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

/**
 * @typedef {{ ok: true, data: any } | { ok: false, error: string, field?: string, status: number }} ApiResult
 */

/**
 * One HTTP call, without the refresh dance.
 * @param {string} path
 * @param {{ method?: string, body?: unknown, auth?: boolean }} opts
 * @returns {Promise<ApiResult>}
 */
async function raw(path, { method = "GET", body, auth = true } = {}) {
  if (!BASE) {
    return { ok: false, status: 0, error: "VITE_API_URL is not set — the app does not know where the API is." };
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 0, error: "Cannot reach the server. Check your connection and try again." };
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.error ?? `Request failed (${res.status}).`, field: data?.field };
  }
  return { ok: true, data };
}

/**
 * Swap the stored refresh token for a new pair.
 * Concurrent callers share one request so a burst of 401s cannot rotate the
 * token several times over and invalidate itself.
 *
 * @returns {Promise<boolean>} Whether a usable access token is now held.
 */
export function refreshSession() {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const res = await raw("/auth/refresh", { method: "POST", body: { refreshToken }, auth: false });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    storeGrant(res.data);
    return true;
  })().finally(() => { inFlightRefresh = null; });

  return inFlightRefresh;
}

/**
 * Call the API, refreshing once if the access token has expired.
 * @param {string} path
 * @param {{ method?: string, body?: unknown, auth?: boolean, retry?: boolean }} [opts]
 * @returns {Promise<ApiResult>}
 */
export async function api(path, opts = {}) {
  const { retry = true, ...rest } = opts;
  const first = await raw(path, rest);
  if (first.ok || first.status !== 401 || !retry || rest.auth === false) return first;

  const refreshed = await refreshSession();
  if (!refreshed) return first;
  return raw(path, rest);
}
