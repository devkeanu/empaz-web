import { useId, useState } from "react";

/**
 * Equity curve. Hover snaps a crosshair to the nearest point and
 * surfaces a mono readout — the whole chart is a reading instrument,
 * not decoration.
 */
export default function AreaChart({ data = [], labels = [], format = (v) => v, height = 260 }) {
  const gid = useId();
  const [hover, setHover] = useState(null);
  if (data.length < 2) return null;

  const W = 720;
  const H = height;
  const padL = 8;
  const padR = 8;
  const padT = 18;
  const padB = 26;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const lo = min - (max - min) * 0.18;
  const hi = max + (max - min) * 0.12;
  const span = hi - lo || 1;

  const x = (i) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - lo) / span) * (H - padT - padB);

  const pts = data.map((v, i) => [x(i), y(v)]);

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

  const gridlines = 4;

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((rel - padL) / (W - padL - padR)) * (data.length - 1))));
    setHover(i);
  };

  return (
    <div className="areachart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="areachart__svg"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label="Equity curve"
      >
        <defs>
          <linearGradient id={`ac-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14130F" stopOpacity=".14" />
            <stop offset="100%" stopColor="#14130F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridlines + 1 }, (_, i) => {
          const gy = padT + (i / gridlines) * (H - padT - padB);
          return <line key={i} x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#DFDBD1" strokeWidth="1" strokeDasharray={i === gridlines ? "0" : "2 4"} />;
        })}

        <path d={`${d}L${pts.at(-1)[0]},${H - padB}L${pts[0][0]},${H - padB}Z`} fill={`url(#ac-${gid})`} />
        <path className="areachart__line" d={d} fill="none" stroke="#14130F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />

        {hover !== null && (
          <g className="areachart__cross">
            <line x1={pts[hover][0]} y1={padT - 6} x2={pts[hover][0]} y2={H - padB} stroke="#DC4B1E" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="5" fill="var(--paper-2)" stroke="#DC4B1E" strokeWidth="2.5" />
          </g>
        )}

        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 6) === 0 ? (
            <text key={i} x={x(i)} y={H - 8} className="areachart__tick" textAnchor={i === 0 ? "start" : "middle"}>
              {l}
            </text>
          ) : null
        )}
      </svg>

      <div className={`areachart__readout${hover !== null ? " is-on" : ""}`} aria-live="polite">
        <span className="eyebrow">{hover !== null ? labels[hover] ?? `Point ${hover + 1}` : "Latest"}</span>
        <strong className="num">{format(data[hover ?? data.length - 1])}</strong>
      </div>
    </div>
  );
}
