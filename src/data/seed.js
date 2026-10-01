/**
 * Static reference data.
 *
 * Accounts used to live here. They are in Postgres now — see `scripts/migrate.js`
 * and the /api functions — so nothing in this file is user data or a secret.
 * What remains is the balance vocabulary shared by the dashboard and the
 * Control desk, plus the instrument rail's quotes.
 */

/** @type {readonly string[]} The five balances the whole product is built around. */
export const BALANCE_KEYS = ["credit", "deposit", "withdraw", "outstanding", "loan"];
/** Copy and tone for each balance, used by the dashboard cards and the editor. */
export const BALANCE_META = {
  credit: {
    label: "Available balance",
    blurb: "Settled funds available to open new positions.",
    hint: "Cleared cash plus realised P&L.",
    tone: "primary",
  },
  deposit: {
    label: "Deposit balance",
    blurb: "Total confirmed deposits credited to this account.",
    hint: "Credited once the transfer is confirmed.",
    tone: "gain",
  },
  withdraw: {
    label: "Withdrawal balance",
    blurb: "Cleared for payout to a linked wallet or bank account.",
    hint: "Free margin less pending settlement.",
    tone: "gain",
  },
  outstanding: {
    label: "Outstanding balance",
    blurb: "Unsettled trades and fees still to clear.",
    hint: "Clears on T+2 rolling settlement.",
    tone: "warn",
  },
  loan: {
    label: "Loan balance",
    blurb: "Drawn against your margin credit facility.",
    hint: "Accrues at SOFR + 1.85% daily.",
    tone: "loss",
  },
};

/**
 * Balances that make up net equity. The deposit balance is a running total of
 * money paid in, so counting it here would double it.
 * @type {readonly string[]}
 */
export const EQUITY_KEYS = ["credit", "withdraw", "outstanding"];

/** Ticker rail — landing page and workspace. Indicative quotes, not a live feed. */
export const instruments = [
  { symbol: "EURUSD", label: "EUR / USD", price: 1.0842,   change: 0.14,  spread: "0.6" },
  { symbol: "GBPUSD", label: "GBP / USD", price: 1.2711,   change: -0.08, spread: "0.9" },
  { symbol: "BTCUSD", label: "BTC / USD", price: 68412.30, change: 1.18,  spread: "12.0" },
  { symbol: "XAUUSD", label: "Gold",      price: 2381.44,  change: 0.87,  spread: "0.18" },
  { symbol: "US30",   label: "Dow 30",    price: 39218.70, change: -0.22, spread: "1.4" },
  { symbol: "NAS100", label: "Nasdaq 100",price: 18204.55, change: 0.63,  spread: "1.0" },
  { symbol: "USOIL",  label: "Brent",     price: 82.16,    change: -1.03, spread: "0.03" },
  { symbol: "ETHUSD", label: "ETH / USD", price: 3241.08,  change: 2.64,  spread: "1.8" },
];
