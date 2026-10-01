import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../store/DataContext.jsx";
import { money, signed, longDate } from "../store/format.js";

const TYPES = ["All", "Deposit", "Withdrawal", "Trade", "Interest", "Repayment", "Dividend", "Adjustment"];

export default function Ledger() {
  const { session, getClient, clients } = useData();
  const client = session.role === "client" ? getClient(session.id) : clients[0];
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!client) return [];
    return client.transactions
      .filter((t) => (type === "All" ? true : t.type === type))
      .filter((t) =>
        q.trim()
          ? `${t.type} ${t.channel} ${t.status}`.toLowerCase().includes(q.trim().toLowerCase())
          : true
      );
  }, [client, type, q]);

  if (!client) return <div className="page"><p className="empty">No account on file.</p></div>;

  const credits = rows.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const debits = rows.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="page">
      <header className="pagehead">
        <div className="pagehead__crumbs">
          <Link to="/dashboard" className="pagehead__back" aria-label="Back to overview">
            <svg width="13" height="11" viewBox="0 0 12 10" fill="none"><path d="M11 5H2M5.5 1 1.5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <span className="eyebrow">Workspace / Ledger</span>
        </div>
      </header>

      <div className="sectionbar">
        <h2 className="sectionbar__title">Full ledger</h2>
        <span className="sectionbar__note eyebrow">{rows.length} of {client.transactions.length} movements</span>
      </div>

      <div className="ledgerstats">
        {[
          ["Credits in view", money(credits, client.currency), "is-gain"],
          ["Debits in view", money(Math.abs(debits), client.currency), "is-loss"],
          ["Net", signed(credits + debits, client.currency), credits + debits >= 0 ? "is-gain" : "is-loss"],
        ].map(([label, value, tone]) => (
          <div className="ledgerstats__cell" key={label}>
            <span className="eyebrow">{label}</span>
            <strong className={`num ${tone}`}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="card card--pad">
        <div className="filters">
          <div className="filters__search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input
              className="input"
              placeholder="Search detail, type or status…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search ledger"
            />
          </div>
          <div className="filters__types">
            {TYPES.map((t) => (
              <button key={t} className={`tag${type === t ? " is-active" : ""}`} onClick={() => setType(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="ledger ledger--full">
          <div className="ledger__head">
            <span className="eyebrow">Date</span>
            <span className="eyebrow">Type</span>
            <span className="eyebrow">Detail</span>
            <span className="eyebrow ledger__right">Amount</span>
            <span className="eyebrow ledger__right">Status</span>
          </div>
          {rows.map((t) => (
            <div className="ledger__row" key={t.id}>
              <span className="num ledger__date">{longDate(t.date)}</span>
              <span className="ledger__type"><i className={`dot dot--${t.type.toLowerCase()}`} />{t.type}</span>
              <span className="ledger__detail">{t.channel}</span>
              <span className={`num ledger__amt ${t.amount >= 0 ? "is-gain" : "is-loss"}`}>{signed(t.amount, client.currency)}</span>
              <span className="ledger__right"><em className={`status status--${t.status.toLowerCase()}`}>{t.status}</em></span>
            </div>
          ))}
          {!rows.length && <p className="empty">Nothing matches that filter.</p>}
        </div>
      </div>
    </div>
  );
}
