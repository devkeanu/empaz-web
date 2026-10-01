import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import Ticker from "./Ticker.jsx";
import { useData } from "../store/DataContext.jsx";

const LINKS = [
  { label: "Markets", href: "#spreads" },
  { label: "Platforms", href: "#platforms" },
  { label: "Accounts", href: "#accounts" },
  { label: "About", href: "#about" },
  { label: "Reviews", href: "#reviews" },
];

export default function SiteNav() {
  const { session } = useData();
  const navigate = useNavigate();
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  const dest = session ? (session.role === "admin" ? "/admin" : "/dashboard") : "/login";

  return (
    <header className={`sitenav${stuck ? " is-stuck" : ""}`}>
      {/* utility strip — the ForTradex top bar, set in mono */}
      <div className="utilbar">
        <div className="shell utilbar__in">
          <span className="utilbar__item utilbar__item--hide">Segregated client funds · Tier-1 custodians</span>
          <div className="utilbar__right">
            <span className="utilbar__item"><b>Zero</b> commission on first 30 days</span>
            <span className="utilbar__sep" aria-hidden="true" />
            <a className="utilbar__item utilbar__link" href="#platforms">Free trading guides →</a>
          </div>
        </div>
      </div>

      <div className="navbar">
        <div className="shell navbar__in">
          <Logo />

          <nav className="navbar__links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="navbar__link">{l.label}</a>
            ))}
          </nav>

          <div className="navbar__actions">
            <Link to="/login" className="navbar__login">Login</Link>
            <button className="btn btn--ink btn--sm" onClick={() => navigate(dest)}>
              {session ? "Open workspace" : "Open account"}
              <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className={`navbar__burger${menu ? " is-open" : ""}`}
              onClick={() => setMenu((m) => !m)}
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </div>

      <Ticker />

      {menu && (
        <div className="mobilemenu">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}</a>
          ))}
          <Link to="/login" onClick={() => setMenu(false)}>Login</Link>
        </div>
      )}
    </header>
  );
}
