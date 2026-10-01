import { useState } from "react";

/** ForTradex's "Who we are / What we do / How it works" block. */
export default function Accordion({ items = [], initial = 0 }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="acc">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className={`acc__item${isOpen ? " is-open" : ""}`} key={item.q}>
            <h3>
              <button
                className="acc__trigger"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="acc__q">{item.q}</span>
                <span className="acc__icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 13 13">
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <div className="acc__panel" hidden={!isOpen}>
              <p>{item.a}</p>
              {item.link && <a className="acc__link" href={item.link.href}>{item.link.label} →</a>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
