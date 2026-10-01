import { useEffect, useMemo, useState } from "react";
import { useData } from "../store/DataContext.jsx";
import { BALANCE_KEYS, BALANCE_META } from "../data/seed.js";
import { money, moneyCompact, signed, parseAmount, shortDate, longDate, todayISO, symbolFor } from "../store/format.js";
import Sparkline from "../components/charts/Sparkline.jsx";

const TONE_COLOR = { primary: "#14130F", gain: "#1E7A4B", warn: "#C9A227", loss: "#DC4B1E" };
const QUICK = [1000, 5000, 10000];
const TX_TYPES = ["Deposit", "Withdrawal", "Trade", "Interest", "Repayment", "Dividend", "Adjustment"];
const TX_STATUS = ["Cleared", "Pending", "Settled", "Posted", "Rejected"];

/* ------------------------------------------------------------------ */

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
        <path d="m5 8.2 2.2 2.2L11.2 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function Admin() {
  const {
    clients, auditLog = [], session,
    setBalances, adjustBalance, updateClient, addTransaction, deleteTransaction, approveClient,
    settleDeposit,
  } = useData();

  const [activeId, setActiveId] = useState(clients[0]?.id);
  const client = clients.find((c) => c.id === activeId) ?? clients[0];

  /* --- balance draft ------------------------------------------------ */
  const [draft, setDraft] = useState({});
  const [toast, setToast] = useState("");

  // Reload the draft whenever the selected client (or their stored balances) change.
  useEffect(() => {
    if (!client) return;
    setDraft(Object.fromEntries(BALANCE_KEYS.map((k) => [k, client.balances[k].toFixed(2)])));
  }, [client?.id, client?.balances]);

  const dirty = useMemo(() => {
    if (!client) return false;
    return BALANCE_KEYS.some((k) => parseAmount(draft[k]) !== client.balances[k]);
  }, [draft, client]);


  /* --- transaction form ---------------------------------------------- */
  const [tx, setTx] = useState({ date: todayISO(), type: "Deposit", channel: "", amount: "", status: "Cleared" });

  /* --- profile form ---------------------------------------------------- */
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!client) return;
    setProfile({
      status: client.status,
      tier: client.tier,
      currency: client.currency,
      leverage: client.leverage,
      creditLimit: String(client.creditLimit),
      notice: client.notice ?? "",
      walletAsset: client.walletAsset || "BTC",
      walletAddress: client.walletAddress || "",
    });
  }, [client?.id]);

  if (!client || !profile) return <div className="page"><p className="empty">No clients on file.</p></div>;

  const cur = client.currency;

  const saveBalances = (e) => {
    e.preventDefault();
    setBalances(client.id, draft);
    setToast(`Balances updated for ${client.name}`);
  };

  const resetDraft = () =>
    setDraft(Object.fromEntries(BALANCE_KEYS.map((k) => [k, client.balances[k].toFixed(2)])));

  const submitTx = (e) => {
    e.preventDefault();
    const amount = parseAmount(tx.amount);
    if (!amount) { setToast("Enter a non-zero amount."); return; }
    addTransaction(client.id, { ...tx, channel: tx.channel.trim() || `${tx.type} · manual entry`, amount });
    setTx({ date: todayISO(), type: "Deposit", channel: "", amount: "", status: "Cleared" });
    setToast("Transaction posted to the ledger");
  };

  const saveProfile = (e) => {
    e.preventDefault();
    updateClient(client.id, { ...profile, creditLimit: parseAmount(profile.creditLimit) });
    setToast("Account settings saved");
  };

  return (
    <div className="page admin">
      <Toast message={toast} onDone={() => setToast("")} />

      <header className="pagehead">
        <div className="pagehead__crumbs">
          <span className="eyebrow">Admin / Control desk</span>
        </div>
        <div className="pagehead__meta">
          <span className="chip">{session.name}</span>
          <span className="chip num">{clients.length} {clients.length === 1 ? "client" : "clients"}</span>
        </div>
      </header>

      <div className="sectionbar">
        <h1 className="sectionbar__title sectionbar__title--lg">Control desk</h1>
        <span className="sectionbar__note eyebrow">Everything you change here appears on the client dashboard immediately</span>
      </div>

      {/* ---------- client picker ------------------------------------ */}
      <div className="picker" role="tablist" aria-label="Select client">
        {clients.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === activeId}
            className={`pickcard${c.id === activeId ? " is-active" : ""}`}
            onClick={() => setActiveId(c.id)}
          >
            <span className="pickcard__avatar">{c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
            <span className="pickcard__body">
              <strong>{c.name}</strong>
              <small className="num">{c.id} · {c.tier}</small>
            </span>
            {c.status === "Pending" && <span className="pickcard__flag">New</span>}
            <span className="pickcard__net num">{moneyCompact(c.balances.credit, c.currency)}</span>
          </button>
        ))}
      </div>

      {/* ---------- APPROVAL ----------------------------------------- */}
      {client.status === "Pending" && (
        <div className="approve">
          <span className="approve__copy">
            <strong>{client.name} is waiting on approval</strong>
            <small>
              Opened {longDate(client.joined)} · {client.id}. Their dashboard stays
              locked until you activate the account.
            </small>
          </span>
          <button
            type="button"
            className="btn btn--ember"
            onClick={async () => {
              const res = await approveClient(client.id);
              setToast(res.ok ? `${client.name} approved` : res.error);
            }}
          >
            Approve account
          </button>
        </div>
      )}

      {/* ---------- BALANCE EDITOR ----------------------------------- */}
      <form className="card card--pad editor" onSubmit={saveBalances}>
        <div className="card__head">
          <div>
            <h2 className="card__title">Dashboard balances</h2>
            <p className="card__sub">
              The five balances on {client.name.split(" ")[0]}’s dashboard. Type an amount, or nudge it with the quick keys.
            </p>
          </div>
          <span className={`savestate${dirty ? " is-dirty" : ""}`}>
            <i /> {dirty ? "Unsaved changes" : "In sync"}
          </span>
        </div>

        <div className="editor__grid">
          {BALANCE_KEYS.map((key) => {
            const meta = BALANCE_META[key];
            const color = TONE_COLOR[meta.tone];
            const current = client.balances[key];
            const next = parseAmount(draft[key] ?? 0);
            const diff = next - current;

            return (
              <div className="editrow" key={key} style={{ "--bal-color": color }}>
                <div className="editrow__head">
                  <span className="editrow__key" aria-hidden="true" />
                  <label className="editrow__label" htmlFor={`bal-${key}`}>{meta.label}</label>
                  <span className="editrow__spark"><Sparkline data={client.history[key]} stroke={color} height={22} fill={false} /></span>
                </div>

                <div className="editrow__input">
                  <span className="editrow__cur num">{symbolFor(cur)}</span>
                  <input
                    id={`bal-${key}`}
                    className="input input--num"
                    inputMode="decimal"
                    value={draft[key] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    onBlur={(e) => setDraft((d) => ({ ...d, [key]: parseAmount(e.target.value).toFixed(2) }))}
                  />
                </div>

                <div className="editrow__quick">
                  {QUICK.map((q) => (
                    <span className="quickpair" key={q}>
                      <button type="button" onClick={() => setDraft((d) => ({ ...d, [key]: (parseAmount(d[key]) - q).toFixed(2) }))} aria-label={`Subtract ${q} from ${meta.label}`}>−</button>
                      <b className="num">{q >= 1000 ? `${q / 1000}k` : q}</b>
                      <button type="button" onClick={() => setDraft((d) => ({ ...d, [key]: (parseAmount(d[key]) + q).toFixed(2) }))} aria-label={`Add ${q} to ${meta.label}`}>+</button>
                    </span>
                  ))}
                </div>

                <div className="editrow__foot">
                  <span className="eyebrow">Live: <b className="num">{money(current, cur)}</b></span>
                  {diff !== 0 && (
                    <span className={`badge ${diff > 0 ? "badge--gain" : "badge--loss"}`}>{signed(diff, cur)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="editor__actions" style={{ marginTop: 24 }}>
          <button type="button" className="btn btn--ghost" onClick={resetDraft} disabled={!dirty}>Discard</button>
          <button type="submit" className="btn btn--ember" disabled={!dirty}>
            Push to dashboard
            <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>

      {/* ---------- PENDING DEPOSITS ---------------------------------- */}
      {client.deposits && client.deposits.length > 0 && (
        <div className="card card--pad">
          <div className="card__head">
            <div>
              <h2 className="card__title">Pending deposits</h2>
              <p className="card__sub">Client transfer declarations waiting on your confirmation.</p>
            </div>
          </div>

          <div className="deplist">
            {client.deposits.filter((d) => d.status === "Pending").length > 0 ? (
              <>
                <div className="deplist__head">
                  <span className="eyebrow">Logged</span>
                  <span className="eyebrow">Amount</span>
                  <span className="eyebrow">Reference</span>
                  <span className="eyebrow deplist__right">Action</span>
                </div>
                {client.deposits
                  .filter((d) => d.status === "Pending")
                  .map((d) => (
                    <div className="deplist__row" key={d.id}>
                      <span className="num deplist__date">{shortDate(d.createdAt)}</span>
                      <span className="num deplist__amt"><strong>{money(d.amount, d.currency)}</strong></span>
                      <span className="deplist__ref num">{d.reference || "—"}</span>
                      <span className="deplist__right">
                        <button
                          type="button"
                          className="btn btn--sm btn--ink"
                          onClick={async () => {
                            const res = await settleDeposit(d.id, "Confirmed", "");
                            setToast(res.ok ? "Deposit confirmed" : res.error);
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="btn btn--sm btn--ghost"
                          onClick={async () => {
                            const res = await settleDeposit(d.id, "Rejected", "Admin review");
                            setToast(res.ok ? "Deposit rejected" : res.error);
                          }}
                        >
                          Reject
                        </button>
                      </span>
                    </div>
                  ))}
              </>
            ) : (
              <p className="empty">No pending deposits.</p>
            )}
          </div>
        </div>
      )}

      {/* ---------- two-column: transaction + settings --------------- */}
      <div className="split split--admin">
        <form className="card card--pad" onSubmit={submitTx}>
          <div className="card__head">
            <div>
              <h2 className="card__title">Post a movement</h2>
              <p className="card__sub">Adds a row to the client ledger. Use a negative amount for a debit.</p>
            </div>
          </div>

          <div className="formgrid">
            <div className="field">
              <label htmlFor="tx-date">Date</label>
              <input id="tx-date" type="date" className="input input--num" value={tx.date} onChange={(e) => setTx({ ...tx, date: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tx-type">Type</label>
              <select id="tx-type" className="input" value={tx.type} onChange={(e) => setTx({ ...tx, type: e.target.value })}>
                {TX_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field field--wide">
              <label htmlFor="tx-detail">Detail</label>
              <input id="tx-detail" className="input" placeholder="Wire · Chase ••4471" value={tx.channel} onChange={(e) => setTx({ ...tx, channel: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tx-amount">Amount ({cur})</label>
              <input id="tx-amount" className="input input--num" inputMode="decimal" placeholder="-2500.00" value={tx.amount} onChange={(e) => setTx({ ...tx, amount: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="tx-status">Status</label>
              <select id="tx-status" className="input" value={tx.status} onChange={(e) => setTx({ ...tx, status: e.target.value })}>
                {TX_STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="quicktx">
            <span className="eyebrow">Or apply straight to a balance</span>
            <div className="quicktx__row">
              {BALANCE_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className="tag"
                  onClick={() => { adjustBalance(client.id, k, parseAmount(tx.amount)); setToast(`${BALANCE_META[k].label} adjusted by ${signed(parseAmount(tx.amount), cur)}`); }}
                  disabled={!parseAmount(tx.amount)}
                >
                  {BALANCE_META[k].label.replace(" balance", "")} {parseAmount(tx.amount) >= 0 ? "+" : "−"}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn--ink btn--wide" type="submit">Post to ledger</button>

          <div className="minileger">
            <span className="eyebrow">Latest movements</span>
            {client.transactions.slice(0, 5).map((t) => (
              <div className="minileger__row" key={t.id}>
                <span className="num minileger__date">{shortDate(t.date)}</span>
                <span className="minileger__type"><i className={`dot dot--${t.type.toLowerCase()}`} />{t.type}</span>
                <span className={`num minileger__amt ${t.amount >= 0 ? "is-gain" : "is-loss"}`}>{signed(t.amount, cur)}</span>
                <button className="minileger__del" onClick={() => deleteTransaction(client.id, t.id)} aria-label={`Delete ${t.type} of ${t.amount}`} type="button">
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
            {!client.transactions.length && <p className="empty">Ledger is empty.</p>}
          </div>
        </form>

        <div className="stack" style={{ gap: 16 }}>
          <form className="card card--pad" onSubmit={saveProfile}>
            <div className="card__head">
              <div>
                <h2 className="card__title">Account settings</h2>
                <p className="card__sub">Status, tier and the facility ceiling behind the gauge.</p>
              </div>
            </div>

            <div className="formgrid">
              <div className="field">
                <label htmlFor="p-status">Status</label>
                <select id="p-status" className="input" value={profile.status} onChange={(e) => setProfile({ ...profile, status: e.target.value })}>
                  {["Pending", "Active", "Restricted", "Suspended", "Closed"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-tier">Tier</label>
                <select id="p-tier" className="input" value={profile.tier} onChange={(e) => setProfile({ ...profile, tier: e.target.value })}>
                  {["Standard", "Prime", "Raw Spread", "Islamic"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-cur">Currency</label>
                <select id="p-cur" className="input" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })}>
                  {["USD", "EUR", "GBP", "NGN"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="p-lev">Leverage</label>
                <select id="p-lev" className="input" value={profile.leverage} onChange={(e) => setProfile({ ...profile, leverage: e.target.value })}>
                  {["1:10", "1:20", "1:30", "1:100", "1:200"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field field--wide">
                <label htmlFor="p-limit">Credit facility ceiling ({profile.currency})</label>
                <input id="p-limit" className="input input--num" inputMode="decimal" value={profile.creditLimit} onChange={(e) => setProfile({ ...profile, creditLimit: e.target.value })} />
              </div>
              <div className="field field--wide">
                <label htmlFor="p-notice">Dashboard notice <span className="hintlabel">shown as a banner to the client</span></label>
                <textarea id="p-notice" className="input input--area" rows={2} placeholder="e.g. Your withdrawal is scheduled for Friday settlement." value={profile.notice} onChange={(e) => setProfile({ ...profile, notice: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="p-wallet-asset">Deposit asset</label>
                <select id="p-wallet-asset" className="input" value={profile.walletAsset} onChange={(e) => setProfile({ ...profile, walletAsset: e.target.value })}>
                  {["BTC", "ETH", "USDC"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field field--wide">
                <label htmlFor="p-wallet-addr">Wallet address</label>
                <input id="p-wallet-addr" className="input" value={profile.walletAddress} onChange={(e) => setProfile({ ...profile, walletAddress: e.target.value })} placeholder="bc1q..." maxLength={120} />
              </div>
            </div>

            <button className="btn btn--ink btn--wide" type="submit">Save settings</button>
          </form>

          <div className="card card--pad">
            <div className="card__head">
              <div>
                <h2 className="card__title">Audit trail</h2>
                <p className="card__sub">Every change made from this desk.</p>
              </div>
            </div>
            <ul className="audit">
              {auditLog.slice(0, 9).map((l) => (
                <li key={l.id}>
                  <span className="audit__time num">{new Date(l.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="audit__body">
                    <strong>{l.action}</strong>
                    <small>{l.detail}</small>
                  </span>
                  <span className="audit__actor eyebrow">{l.actor}</span>
                </li>
              ))}
              {!auditLog.length && <p className="empty">No changes yet this session.</p>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
