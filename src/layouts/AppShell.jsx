import { useEffect, useState } from "react";
import { NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Ticker from "../components/Ticker.jsx";
import { useData } from "../store/DataContext.jsx";

const ICONS = {
  dashboard: "M2 9.2 9 3l7 6.2V16a1 1 0 0 1-1 1h-3.4v-4.2H7.4V17H4a1 1 0 0 1-1-1Z",
  admin: "M9 2.2 15.5 5v4.4c0 3.6-2.6 6.3-6.5 7.4-3.9-1.1-6.5-3.8-6.5-7.4V5Z",
  ledger: "M4 2.5h10v13H4Zm2.5 3.2h5m-5 3h5m-5 3h3",
  deposit: "M9 3v9m0 0 3.4-3.4M9 12 5.6 8.6M3.5 14.5h11",
  markets: "M2.5 13.5 6.5 8l3 3 5.5-7",
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d={ICONS[name]} stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AppShell({ role, children }) {
  const { session, booting, signOut } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  // The session lives in an httpOnly cookie, so it is only known once
  // /api/auth/me has answered. Redirecting before then would bounce a
  // signed-in visitor straight back to the login page on every reload.
  if (booting) {
    return (
      <div className="booting" role="status" aria-live="polite">
        <span className="booting__pulse" aria-hidden="true" />
        <span className="eyebrow">Restoring session</span>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && session.role !== role) {
    return <Navigate to={session.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const nav =
    session.role === "admin"
      ? [
          { to: "/admin", label: "Control desk", icon: "admin", end: true },
          { to: "/dashboard", label: "Client view", icon: "dashboard" },
        ]
      : [
          { to: "/dashboard", label: "Overview", icon: "dashboard", end: true },
          { to: "/dashboard/deposit", label: "Deposit", icon: "deposit" },
          { to: "/dashboard/ledger", label: "Ledger", icon: "ledger" },
        ];

  const initials = session.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="shellapp">
      <aside className={`rail${open ? " is-open" : ""}`}>
        <div className="rail__brand">
          <Logo inverse />
          <span className="rail__env eyebrow">{session.role === "admin" ? "Admin" : "Client"}</span>
        </div>

        <nav className="rail__nav" aria-label="Workspace">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `rail__link${isActive ? " is-active" : ""}`}>
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
          <a className="rail__link" href="/#spreads" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            <Icon name="markets" />
            Markets
          </a>
        </nav>

        <div className="rail__foot">
          <div className="rail__user">
            <span className="rail__avatar">{initials}</span>
            <span>
              <strong>{session.name}</strong>
              <small className="num">{session.role === "client" ? session.id : session.email}</small>
            </span>
          </div>
          <button className="rail__signout" onClick={async () => { await signOut(); navigate("/"); }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6.5 2.5H3.5v11h3M10 5l3 3-3 3M13 8H6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {open && <button className="rail__scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="workspace">
        <div className="workspace__ticker"><Ticker variant="app" /></div>
        <button className="workspace__menu" onClick={() => setOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
        {children}
      </div>
    </div>
  );
}
