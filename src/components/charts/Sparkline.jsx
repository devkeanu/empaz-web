import { useId } from "react";

/** Tiny trend line for a balance card. Area fill + terminal dot. */
export default function Sparkline({ data = [], stroke = "currentColor", height = 40, fill = true }) {
  const gid = useId();
  if (data.length < 2) return <svg height={height} width="100%" aria-hidden="true" />;

  const W = 100;
  const H = height;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - pad - ((v - min) / span) * (H - pad * 2),
  ]);

  // Catmull-Rom → cubic bezier, so the line reads as a curve not a zigzag.
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }

  const last = pts[pts.length - 1];

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${W} ${H}`}
      height={H}
      width="100%"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sg-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity=".20" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d}L${W},${H}L0,${H}Z`} fill={`url(#sg-${gid})`} />}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
