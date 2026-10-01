import { Link } from "react-router-dom";

/** Wordmark: ledger bars + ember dot. The dot is the only colour in the mark. */
export default function Logo({ to = "/", inverse = false, compact = false }) {
  const ink = inverse ? "var(--ink-inv)" : "var(--ink)";
  return (
    <Link to={to} className={`logo${inverse ? " logo--inv" : ""}`} aria-label="Farverde Markets — home">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="0.5" y="12" width="4" height="9.5" rx="1" fill={ink} opacity=".45" />
        <rect x="6.5" y="7"  width="4" height="14.5" rx="1" fill={ink} opacity=".7" />
        <rect x="12.5" y="2" width="4" height="19.5" rx="1" fill={ink} />
        <circle cx="19.6" cy="3.4" r="2.4" fill="var(--ember)" />
      </svg>
      {!compact && <span className="logo__word">Farverde</span>}
    </Link>
  );
}
