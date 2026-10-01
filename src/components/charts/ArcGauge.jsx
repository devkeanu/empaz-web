import { useId } from "react";

const polar = (cx, cy, r, deg) => {
  const rad = ((deg - 180) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};

/**
 * Half-circle capacity arc — the CashPanel hero move, redrawn in ink.
 * `value` / `max` fills the track; ticks mark every 10%.
 */
export default function ArcGauge({ value = 0, max = 1, label, caption, children }) {
  const gid = useId();
  const W = 420;
  const H = 232;
  const cx = W / 2;
  const cy = H - 16;
  const r = 176;
  const ratio = Math.max(0, Math.min(1, max ? value / max : 0));

  const arcPath = (from, to) => {
    const [x1, y1] = polar(cx, cy, r, from);
    const [x2, y2] = polar(cx, cy, r, to);
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
  };

  const [hx, hy] = polar(cx, cy, r, ratio * 180);

  return (
    <div className="gauge">
      <svg viewBox={`0 0 ${W} ${H}`} className="gauge__svg" role="img" aria-label={`${label}: ${Math.round(ratio * 100)}% of facility`}>
        <defs>
          <linearGradient id={`ga-${gid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#DC4B1E" />
            <stop offset="55%" stopColor="#14130F" />
            <stop offset="100%" stopColor="#14130F" />
          </linearGradient>
        </defs>

        {/* graticule — echoes a printed dial */}
        {Array.from({ length: 11 }, (_, i) => {
          const deg = i * 18;
          const [x1, y1] = polar(cx, cy, r - 13, deg);
          const [x2, y2] = polar(cx, cy, r + 1, deg);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#DFDBD1" strokeWidth="1" />;
        })}

        <path d={arcPath(0, 180)} fill="none" stroke="#E4E0D6" strokeWidth="9" strokeLinecap="round" />
        {ratio > 0.004 && (
          <path
            className="gauge__fill"
            d={arcPath(0, ratio * 180)}
            fill="none"
            stroke={`url(#ga-${gid})`}
            strokeWidth="9"
            strokeLinecap="round"
            pathLength="100"
          />
        )}
        <circle cx={hx} cy={hy} r="7" fill="var(--paper-2)" stroke="var(--ink)" strokeWidth="2.5" />
      </svg>

      <div className="gauge__core">
        {label && <span className="eyebrow">{label}</span>}
        {children}
        {caption && <span className="gauge__caption num">{caption}</span>}
      </div>
    </div>
  );
}
