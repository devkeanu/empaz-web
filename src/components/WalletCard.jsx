import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * The deposit address block that sits above the balances.
 *
 * The address is set per client by the desk, so it can be missing — in which
 * case saying so plainly beats showing an empty box someone might copy.
 *
 * @param {{ address: string, asset: string, compact?: boolean }} props
 * @returns {JSX.Element}
 */
export default function WalletCard({ address, asset = "BTC", compact = false }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch {
      return; // clipboard blocked; the address is on screen to copy by hand
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (!address) {
    return (
      <section className="wallet wallet--empty" aria-label="Deposit address">
        <div className="wallet__copy">
          <span className="eyebrow">Deposit address</span>
          <p className="wallet__pending">
            Your desk is still preparing a deposit address for this account.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="wallet" aria-label="Deposit address">
      <div className="wallet__main">
        <span className="eyebrow eyebrow--dot eyebrow--ember">Deposit address · {asset}</span>
        <div className="wallet__addrRow">
          <code className="wallet__addr num" title={address}>{address}</code>
          <button type="button" className="wallet__copyBtn" onClick={copy} aria-live="polite">
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7.5 5.5 10.5 11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="4.6" y="4.6" width="7.2" height="7.2" rx="1.4" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M9.4 4.6V3.4a1.2 1.2 0 0 0-1.2-1.2H3.4a1.2 1.2 0 0 0-1.2 1.2v4.8a1.2 1.2 0 0 0 1.2 1.2h1.2" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <p className="wallet__note">
          Send only <strong>{asset}</strong> to this address. Anything else is lost.
          Your balance updates once the desk confirms the transfer.
        </p>
      </div>

      {!compact && (
        <Link to="/dashboard/deposit" className="btn btn--ember wallet__cta">
          Deposit funds
          <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
            <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      )}
    </section>
  );
}
