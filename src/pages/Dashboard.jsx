import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../store/DataContext.jsx";
import { BALANCE_KEYS, BALANCE_META } from "../data/seed.js";
import { money, moneyCompact, signed, shortDate, longDate, pct } from "../store/format.js";
import CountUp from "../components/CountUp.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import AreaChart from "../components/charts/AreaChart.jsx";
import AllocationBar from "../components/charts/AllocationBar.jsx";
import WalletCard from "../components/WalletCard.jsx";

const TONE_COLOR = {
  primary: "#14130F",
  gain: "#1E7A4B",
  warn: "#C9A227",
  loss: "#DC4B1E",
};

/** Percent move between the first and last point of a series. */
function trend(series = []) {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series.at(-1);
  if (!first) return 0;
  return ((last - first) / Math.abs(first)) * 100;
}

/* ------------------------------------------------------------------ */

function BalanceCard({ meta, value, series, currency, index }) {
  const color = TONE_COLOR[meta.tone];
  const delta = trend(series);
  // A rising loan or outstanding balance is bad news; invert the read.
  const goodWhenUp = meta.tone === "primary" || meta.tone === "gain";
  const positive = goodWhenUp ? delta >= 0 : delta <= 0;

  return (
    <article className="bal" style={{ "--bal-color": color, animationDelay: `${index * 90}ms` }}>
      <header className="bal__head">
        <span className="bal__key" aria-hidden="true" />
        <span className="eyebrow">{meta.label}</span>
      </header>

      <strong className="bal__value num">
        <CountUp value={value} format={(v) => money(v, currency)} />
      </strong>

      <div className="bal__meta">
        <span className={`badge ${positive ? "badge--gain" : "badge--loss"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="bal__period eyebrow">12-month</span>
      </div>

      <div className="bal__spark">
        <Sparkline data={series} stroke={color} height={44} />
      </div>

      <p className="bal__blurb">{meta.blurb}</p>
      <p className="bal__hint eyebrow">{meta.hint}</p>
    </article>
  );
}

/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { session, getClient, clients } = useData();

  // An admin peeking at "Client view" sees the first client on file.
  const client = session.role === "client" ? getClient(session.id) : clients[0];

  if (!client) {
    return (
      <div className="page">
        <p className="empty">No account on file.</p>
      </div>
    );
  }

  // A new account is reviewed by the desk before it is funded. Until then the
  // dashboard has nothing truthful to show, so it says so rather than
  // rendering four zeroes as though they were positions.
  if (session.role === "client" && client.status === "Pending") {
    return (
      <div className="page pending">
        <div className="pending__card">
          <span className="pending__mark" aria-hidden="true" />
          <span className="eyebrow eyebrow--ember">Account under review</span>
          <h1>We’re verifying your account</h1>
          <p>
            Your relationship desk is reviewing the details you submitted. Once
            they approve the account, your five balances appear here — usually
            within one business day.
          </p>
          <span className="pending__ref">
            <span className="eyebrow">Your reference</span>
            <strong className="num">{client.id}</strong>
          </span>
        </div>
      </div>
    );
  }

  const facilityUsed = client.creditLimit ? client.balances.loan / client.creditLimit : 0;

  return (
    <div className="page">
      {/* ---------- page head ---------------------------------------- */}
      <header className="pagehead">
        <div className="pagehead__crumbs">
          <Link to="/" className="pagehead__back" aria-label="Back to site">
            <svg width="13" height="11" viewBox="0 0 12 10" fill="none"><path d="M11 5H2M5.5 1 1.5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <span className="eyebrow">Workspace / Overview</span>
        </div>

        <div className="pagehead__meta">
          <span className="chip"><b className="num">{client.id}</b></span>
          <span className="chip">{client.tier} desk</span>
          <span className="chip">Leverage <b className="num">{client.leverage}</b></span>
          <span className={`chip chip--status chip--${client.status.toLowerCase()}`}>{client.status}</span>
        </div>
      </header>

      {client.notice && (
        <div className="notice" role="status">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4.6v4M8 10.8v.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <p>{client.notice}</p>
        </div>
      )}

      {/* ---------- greeting ----------------------------------------- */}
      <section className="dashgreet">
        <span className="eyebrow eyebrow--dot eyebrow--ember">Good to see you</span>
        <h1 className="dashhero__title">{client.name.split(" ")[0]}’s desk</h1>
        <p className="dashhero__sub">
          Five balances, reconciled {client.updatedAt ? longDate(client.updatedAt) : "nightly"}
          {client.updatedAt ? " by your relationship desk" : ""}.
        </p>
      </section>

      {/* ---------- wallet address ------------------------------------ */}
      <WalletCard address={client.walletAddress} asset={client.walletAsset} />

      {/* ---------- THE FIVE BALANCES -------------------------------- */}
      <section className="balances" aria-label="Account balances">
        <div className="sectionbar">
          <h2 className="sectionbar__title">Balances</h2>
          <span className="sectionbar__note eyebrow">Set by your relationship desk · {client.currency}</span>
        </div>

        <div className="balances__grid">
          {BALANCE_KEYS.map((key, i) => (
            <BalanceCard
              key={key}
              meta={BALANCE_META[key]}
              value={client.balances[key]}
              series={client.history[key]}
              currency={client.currency}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ---------- allocation ----------------------------------------- */}
      <section className="card card--pad">
        <div className="card__head">
          <div>
            <h3 className="card__title">Allocation</h3>
            <p className="card__sub">By position weight.</p>
          </div>
        </div>
        <AllocationBar items={client.holdings} />

        <ul className="holdings">
          {client.holdings.map((h) => (
            <li key={h.symbol}>
              <span className="holdings__sym num">{h.symbol}</span>
              <span className="holdings__name">{h.name}</span>
              <span className="holdings__val num">{moneyCompact(h.value, client.currency)}</span>
              <span className={`holdings__chg num ${h.change >= 0 ? "is-gain" : "is-loss"}`}>{pct(h.change)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- recent activity ---------------------------------- */}
      <section className="card card--pad">
        <div className="card__head">
          <div>
            <h3 className="card__title">Recent activity</h3>
            <p className="card__sub">Last {Math.min(6, client.transactions.length)} movements on this account.</p>
          </div>
          <Link to="/dashboard/ledger" className="btn btn--ghost btn--sm">
            Full ledger
            <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
              <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className="ledger">
          <div className="ledger__head">
            <span className="eyebrow">Date</span>
            <span className="eyebrow">Type</span>
            <span className="eyebrow">Detail</span>
            <span className="eyebrow ledger__right">Amount</span>
            <span className="eyebrow ledger__right">Status</span>
          </div>
          {client.transactions.slice(0, 6).map((t) => (
            <div className="ledger__row" key={t.id}>
              <span className="num ledger__date">{shortDate(t.date)}</span>
              <span className="ledger__type"><i className={`dot dot--${t.type.toLowerCase()}`} />{t.type}</span>
              <span className="ledger__detail">{t.channel}</span>
              <span className={`num ledger__amt ${t.amount >= 0 ? "is-gain" : "is-loss"}`}>{signed(t.amount, client.currency)}</span>
              <span className="ledger__right"><em className={`status status--${t.status.toLowerCase()}`}>{t.status}</em></span>
            </div>
          ))}
          {!client.transactions.length && <p className="empty">No movements recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
