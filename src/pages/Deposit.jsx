import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../store/DataContext.jsx";
import { money, longDate } from "../store/format.js";
import WalletCard from "../components/WalletCard.jsx";

/**
 * Deposit funds.
 *
 * Copy the address, send the transfer from wherever you hold the asset, then
 * tell the desk the amount. Nothing is credited here — the request sits as
 * pending until the desk confirms the transfer has arrived.
 *
 * @returns {JSX.Element}
 */
export default function Deposit() {
  const { session, getClient, clients, deposits, declareDeposit } = useData();
  const client = session.role === "client" ? getClient(session.id) : clients[0];

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!client) {
    return <div className="page"><p className="empty">No account on file.</p></div>;
  }

  const mine = deposits.filter((d) => d.accountId === client.id);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const value = Number(String(amount).replace(/[^0-9.]/g, ""));
    if (!value || value <= 0) return setError("Enter the amount you sent.");

    setBusy(true);
    const res = await declareDeposit({ amount: value, reference: reference.trim() });
    setBusy(false);
    if (!res.ok) return setError(res.error);

    setAmount("");
    setReference("");
    setDone(true);
  };

  return (
    <div className="page">
      <header className="pagehead">
        <div className="pagehead__crumbs">
          <Link to="/dashboard" className="pagehead__back" aria-label="Back to overview">
            <svg width="13" height="11" viewBox="0 0 12 10" fill="none"><path d="M11 5H2M5.5 1 1.5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <span className="eyebrow">Workspace / Deposit</span>
        </div>
        <div className="pagehead__meta">
          <span className="chip"><b className="num">{client.id}</b></span>
          <span className="chip">{client.currency}</span>
        </div>
      </header>

      <div className="sectionbar">
        <h1 className="sectionbar__title sectionbar__title--lg">Deposit funds</h1>
        <span className="sectionbar__note eyebrow">Send to the address below, then tell us the amount</span>
      </div>

      {/* ---------- step 1: the address ------------------------------ */}
      <ol className="steps">
        <li className="steps__item">
          <span className="steps__num num">01</span>
          <div className="steps__body">
            <h2 className="steps__title">Copy your deposit address</h2>
            <p className="steps__sub">
              Send the transfer from whichever app holds your {client.walletAsset}.
            </p>
            <WalletCard address={client.walletAddress} asset={client.walletAsset} compact />
          </div>
        </li>

        {/* ---------- step 2: declare it ----------------------------- */}
        <li className="steps__item">
          <span className="steps__num num">02</span>
          <div className="steps__body">
            <h2 className="steps__title">Tell the desk what you sent</h2>
            <p className="steps__sub">
              Your balance updates once the desk confirms the transfer has arrived.
              Nothing is credited before then.
            </p>

            {done ? (
              <div className="depositdone" role="status">
                <span className="depositdone__mark" aria-hidden="true" />
                <div>
                  <strong>Logged with your desk</strong>
                  <p>
                    We will credit it as soon as the transfer confirms. You can track
                    it below.
                  </p>
                </div>
                <button type="button" className="btn btn--ghost" onClick={() => setDone(false)}>
                  Log another
                </button>
              </div>
            ) : (
              <form className="depositform" onSubmit={submit} noValidate>
                <div className="field">
                  <label htmlFor="amount">Amount sent ({client.currency})</label>
                  <input
                    id="amount"
                    className="input input--num"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="reference">Transaction ID <span className="field__opt">optional</span></label>
                  <input
                    id="reference"
                    className="input"
                    placeholder="Paste the transaction hash to speed up confirmation"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="auth__error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.6M7 9.6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    {error}
                  </p>
                )}

                <button className="btn btn--ink" type="submit" disabled={busy || !client.walletAddress}>
                  {busy ? "Sending…" : "Notify the desk"}
                </button>
              </form>
            )}
          </div>
        </li>
      </ol>

      {/* ---------- history ------------------------------------------ */}
      <section className="card card--pad">
        <div className="card__head">
          <div>
            <h3 className="card__title">Your deposits</h3>
            <p className="card__sub">Pending entries have not moved your balance yet.</p>
          </div>
        </div>

        {mine.length === 0 ? (
          <p className="empty">Nothing logged yet.</p>
        ) : (
          <div className="deplist">
            <div className="deplist__head">
              <span className="eyebrow">Logged</span>
              <span className="eyebrow">Amount</span>
              <span className="eyebrow">Reference</span>
              <span className="eyebrow deplist__right">Status</span>
            </div>
            {mine.map((d) => (
              <div className="deplist__row" key={d.id}>
                <span className="num deplist__date">{longDate(d.createdAt)}</span>
                <span className="num deplist__amt">{money(d.amount, d.currency)}</span>
                <span className="deplist__ref num">{d.reference || "—"}</span>
                <span className="deplist__right">
                  <em className={`status status--${d.status.toLowerCase()}`}>{d.status}</em>
                  {d.note && <small className="deplist__note">{d.note}</small>}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
