const CURRENCY_SYMBOL = { USD: "$", EUR: "€", GBP: "£", NGN: "₦" };

export const symbolFor = (code = "USD") => CURRENCY_SYMBOL[code] ?? "$";

/** $148,250.00 — always two decimals, always tabular. */
export function money(value, currency = "USD", { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return (
    symbolFor(currency) +
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

/** Compact for tight cells: $148.3K / $1.42M */
export function moneyCompact(value, currency = "USD") {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const s = symbolFor(currency);
  if (abs >= 1e9) return `${sign}${s}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${s}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${s}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${s}${abs.toFixed(2)}`;
}

/** +1,240.00 / -318.50 — signed, for ledger rows. */
export function signed(value, currency = "USD") {
  const n = Number(value) || 0;
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return sign + money(Math.abs(n), currency);
}

export const pct = (n, digits = 2) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Number(n) || 0).toFixed(digits)}%`;

export function shortDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function longDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

/** Strip formatting so "$12,500.50" pasted into an admin field still parses. */
export function parseAmount(raw) {
  if (typeof raw === "number") return raw;
  const cleaned = String(raw ?? "").replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
