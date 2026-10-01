const TONES = ["#14130F", "#DC4B1E", "#4A473F", "#C9A227", "#1E7A4B", "#8A867B"];

/** Stacked weight bar + keyed legend. Replaces a pie; reads at a glance. */
export default function AllocationBar({ items = [] }) {
  const total = items.reduce((s, i) => s + i.weight, 0) || 1;
  return (
    <div className="alloc">
      <div className="alloc__bar" role="img" aria-label="Portfolio allocation by weight">
        {items.map((it, i) => (
          <span
            key={it.symbol}
            className="alloc__seg"
            style={{
              width: `${(it.weight / total) * 100}%`,
              background: TONES[i % TONES.length],
              animationDelay: `${i * 70}ms`,
            }}
            title={`${it.name} · ${it.weight}%`}
          />
        ))}
      </div>
      <ul className="alloc__key">
        {items.map((it, i) => (
          <li key={it.symbol}>
            <span className="alloc__dot" style={{ background: TONES[i % TONES.length] }} />
            <span className="alloc__sym">{it.symbol}</span>
            <span className="alloc__pct num">{it.weight}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
