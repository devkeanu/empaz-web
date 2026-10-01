import { useEffect, useRef, useState } from "react";

/**
 * Eases a number to its new value. Every admin edit therefore *moves*
 * on the client dashboard rather than snapping — the change is legible.
 */
export default function CountUp({ value = 0, format = (v) => v.toFixed(2), duration = 900, className = "" }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // quartic out
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
