import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useData } from "../store/DataContext.jsx";

/**
 * Open an account.
 *
 * The aside sets the expectation that this is not instant: new accounts are
 * reviewed by the desk before they can trade, so the three steps are stated
 * up front rather than discovered after signing up.
 */

const CURRENCIES = ["USD", "GBP", "EUR"];

const STEPS = [
  ["01", "Open the account", "Name, email and your base currency. Nothing else is needed today."],
  ["02", "Desk review", "A relationship manager verifies the account and sets your opening terms."],
  ["03", "Funded and live", "Your four balances appear on the dashboard the moment the desk approves you."],
];

/** @returns {JSX.Element} */
export default function Signup() {
  const { signUp, session } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", currency: "USD", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to={session.role === "admin" ? "/admin" : "/dashboard"} replace />;

  /** @param {string} key @returns {(e: Event) => void} */
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) return setError("Enter your full name.");
    if (form.password.length < 8) return setError("Your password needs at least 8 characters.");
    if (form.password !== form.confirm) return setError("Those passwords don’t match.");

    setBusy(true);
    const res = await signUp({
      name: form.name.trim(),
      email: form.email.trim(),
      currency: form.currency,
      password: form.password,
    });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    navigate("/dashboard", { replace: true });
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
          <span className="eyebrow eyebrow--dot eyebrow--ember">Open an account</span>
          <h1>
            Three steps,
            <br />
            then you <em>trade</em>
          </h1>
          <p>
            Every account is opened against a named relationship desk. That is
            why there is a review step — and why your balances are set by a
            person, not a form.
          </p>
        </div>

        <ol className="auth__steps">
          {STEPS.map(([n, title, body]) => (
            <li className="auth__step" key={n}>
              <span className="auth__stepNum num">{n}</span>
              <span className="auth__stepBody">
                <strong>{title}</strong>
                <small>{body}</small>
              </span>
            </li>
          ))}
        </ol>
      </aside>

      {/* ---- form column -------------------------------------------- */}
      <main className="auth__main">
        <div className="auth__form">
          <span className="eyebrow">New client</span>
          <h2 className="auth__title">Open your desk</h2>
          <p className="auth__sub">Already with us? <Link to="/login" className="auth__switch">Sign in instead</Link>.</p>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                type="text"
                autoComplete="name"
                placeholder="As it appears on your ID"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@desk.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="currency">Base currency</label>
              <select id="currency" className="input" value={form.currency} onChange={set("currency")}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <small className="field__hint">Every balance on your dashboard is denominated in this.</small>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={set("confirm")}
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
              {busy ? "Opening account…" : "Open account"}
              <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <p className="auth__fine">
            Trading on margin carries a high risk of losing money. You will be
            asked to confirm you understand this before your account is funded.
          </p>
        </div>
      </main>
    </div>
  );
}
