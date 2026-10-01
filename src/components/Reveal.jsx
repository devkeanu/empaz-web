import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered reveal. One shared observer pattern, staggered by
 * `delay`, disabled outright when the user prefers reduced motion.
 */
export default function Reveal({ children, delay = 0, as: Tag = "div", className = "", y = 22, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? " is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, "--reveal-y": `${y}px` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
