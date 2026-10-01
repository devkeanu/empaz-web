import { useData } from "../store/DataContext.jsx";

const fmtPrice = (n) => (n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : n.toFixed(4));

export default function Ticker({ variant = "landing" }) {
  const { instruments } = useData();
  const rows = instruments;
  const loop = [...rows, ...rows];

  return (
    <div className={`ticker ticker--${variant}`} role="region" aria-label="Live market prices">
      <div className="ticker__legend eyebrow">
        <span className="ticker__pulse" aria-hidden="true" />
        Live
      </div>
      <div className="ticker__viewport">
        <div className="ticker__track">
          {loop.map((r, i) => (
            <div className="ticker__item" key={`${r.symbol}-${i}`} aria-hidden={i >= rows.length}>
              <span className="ticker__sym">{r.symbol}</span>
              <span className="ticker__price num">{fmtPrice(r.price)}</span>
              <span className={`ticker__chg num ${r.change >= 0 ? "is-gain" : "is-loss"}`}>
                {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
