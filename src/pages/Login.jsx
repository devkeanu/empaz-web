import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import { useData } from "../store/DataContext.jsx";

export default function Login() {
  const { signIn, session } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to={session.role === "admin" ? "/admin" : "/dashboard"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn(email, password);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    navigate(res.session.role === "admin" ? "/admin" : "/dashboard", { replace: true });
  };

  return (
    <div className="auth">
      {/* ---- brand column ------------------------------------------- */}
      <aside className="auth__aside">
        <div className="auth__asideTop">
          <Logo to="/" inverse />
          <Link to="/" className="auth__back">← Back to site</Link>
        </div>

        <div className="auth__pitch">
          <span className="eyebrow eyebrow--dot eyebrow--ember">Client workspace</span>
          <h1>
            Every balance,
            <br />
            reconciled <em>nightly</em>
          </h1>
          <p>
            Credit, withdrawable, outstanding and drawn loan — four numbers,
            one source of truth, updated by your relationship desk in real time.
          </p>
        </div>

        <div className="auth__card">
          <div className="auth__cardTop">
            <span className="eyebrow">Total equity</span>
            <span className="badge badge--gain">▲ 12.4%</span>
          </div>
          <strong className="auth__cardValue num">$148,250.00</strong>
          <Sparkline data={[96, 101, 99, 108, 114, 112, 121, 128, 126, 137, 142, 148]} stroke="#DC4B1E" height={54} />
          <div className="auth__cardFoot">
            {[["Withdrawable", "$42,680"], ["Outstanding", "$18,940"], ["Loan", "$75,000"]].map(([k, v]) => (
              <div key={k}>
                <span className="eyebrow">{k}</span>
                <strong className="num">{v}</strong>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ---- form column -------------------------------------------- */}
      <main className="auth__main">
        <div className="auth__form">
          <span className="eyebrow">Secure sign-in</span>
          <h2 className="auth__title">Welcome back</h2>
          <p className="auth__sub">No account yet? <Link to="/signup" className="auth__switch">Open one</Link>.</p>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="username"
                placeholder="you@desk.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="auth__error" role="alert">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.6M7 9.6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                {error}
              </p>
            )}

            <button className="btn btn--ink btn--wide" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

        </div>
      </main>
    </div>
  );
}
