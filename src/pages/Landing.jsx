import { useState } from "react";
import { Link } from "react-router-dom";
import SiteNav from "../components/SiteNav.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import Accordion from "../components/Accordion.jsx";
import Reveal from "../components/Reveal.jsx";
import ArcGauge from "../components/charts/ArcGauge.jsx";
import Sparkline from "../components/charts/Sparkline.jsx";
import CountUp from "../components/CountUp.jsx";

/* ------------------------------------------------------------------ */
/* content                                                             */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: "$2.4B", label: "Traded daily" },
  { value: "180K+", label: "Funded accounts" },
  { value: "0.0", label: "Pips raw spread" },
  { value: "11ms", label: "Median execution" },
];

const FAQ = [
  {
    q: "Who we are",
    a: "Farverde is a multi-asset broker built by people who ran execution desks before they ran a company. We hold client money with Tier-1 custodians, segregated from our own, and we publish our fill statistics every quarter.",
    link: { href: "#about", label: "Read the execution report" },
  },
  {
    q: "What we do",
    a: "Direct market access across forex, equities, indices, metals and crypto CFDs — priced from eleven liquidity providers and streamed raw. Alongside it sits a margin credit facility so working capital never blocks a position.",
  },
  {
    q: "How it works",
    a: "Open an account in under four minutes, fund it by wire, card or local rail, and your desk goes live the same day. Your relationship manager sets credit terms; every balance on your dashboard is reconciled nightly.",
  },
];

const SPREAD_TABS = {
  Forex: [
    { flag: "🇪🇺", name: "Euro", sub: "EUR / USD", sell: 32, spread: "0.6" },
    { flag: "🇬🇧", name: "Pound", sub: "GBP / USD", sell: 55, spread: "0.9" },
    { flag: "🇯🇵", name: "Yen", sub: "USD / JPY", sell: 41, spread: "0.7" },
    { flag: "🇨🇦", name: "Loonie", sub: "USD / CAD", sell: 50, spread: "1.1" },
    { flag: "🇦🇺", name: "Aussie", sub: "AUD / USD", sell: 60, spread: "0.8" },
  ],
  "Crypto CFDs": [
    { flag: "₿", name: "Bitcoin", sub: "BTC / USD", sell: 28, spread: "12.0" },
    { flag: "Ξ", name: "Ethereum", sub: "ETH / USD", sell: 36, spread: "1.80" },
    { flag: "◎", name: "Solana", sub: "SOL / USD", sell: 44, spread: "0.24" },
    { flag: "✕", name: "Ripple", sub: "XRP / USD", sell: 62, spread: "0.004" },
  ],
  "Share CFDs": [
    { flag: "▮", name: "NVIDIA", sub: "NVDA · NASDAQ", sell: 24, spread: "0.09" },
    { flag: "▮", name: "Apple", sub: "AAPL · NASDAQ", sell: 39, spread: "0.05" },
    { flag: "▮", name: "Tesla", sub: "TSLA · NASDAQ", sell: 58, spread: "0.11" },
    { flag: "▮", name: "Shell", sub: "SHEL · LSE", sell: 47, spread: "0.07" },
  ],
  Commodities: [
    { flag: "🛢", name: "Brent Crude", sub: "UKOIL", sell: 57, spread: "0.03" },
    { flag: "🛢", name: "WTI", sub: "USOIL", sell: 54, spread: "0.03" },
    { flag: "🌾", name: "Wheat", sub: "WHEAT", sell: 49, spread: "0.25" },
    { flag: "☕", name: "Coffee", sub: "COFFEE", sell: 33, spread: "0.40" },
  ],
  "Spot Metals": [
    { flag: "◆", name: "Gold", sub: "XAU / USD", sell: 29, spread: "0.18" },
    { flag: "◆", name: "Silver", sub: "XAG / USD", sell: 43, spread: "0.02" },
    { flag: "◆", name: "Platinum", sub: "XPT / USD", sell: 51, spread: "1.60" },
  ],
  Indices: [
    { flag: "▤", name: "Dow 30", sub: "US30", sell: 46, spread: "1.4" },
    { flag: "▤", name: "Nasdaq 100", sub: "NAS100", sell: 31, spread: "1.0" },
    { flag: "▤", name: "FTSE 100", sub: "UK100", sell: 52, spread: "1.2" },
    { flag: "▤", name: "DAX 40", sub: "GER40", sell: 48, spread: "0.9" },
  ],
};

const PLATFORMS = [
  {
    key: "Farverde Terminal",
    tag: "Flagship",
    body: "Our own terminal. Depth of market, bracket orders, and a credit panel that shows exactly what your facility will fund before you commit to a position.",
    points: ["Level-2 depth", "Bracket & OCO", "Credit-aware sizing", "Web + desktop"],
  },
  {
    key: "MetaTrader 5",
    tag: "Popular",
    body: "The full MT5 build with Farverde raw pricing piped in, hedging enabled and 21 timeframes. Bring your own Expert Advisors — we do not restrict automated strategies.",
    points: ["EAs unrestricted", "21 timeframes", "Hedging enabled", "VPS included"],
  },
  {
    key: "MetaTrader 4",
    tag: "Classic",
    body: "Still the fastest way to run legacy EAs. Same liquidity, same execution venue, no synthetic dealing desk sitting between you and the fill.",
    points: ["Legacy EA support", "One-click trading", "Custom indicators", "Mobile sync"],
  },
  {
    key: "API & FIX 4.4",
    tag: "Institutional",
    body: "Co-located FIX sessions for systematic desks, with a REST and WebSocket layer for everything else. Sandbox keys are issued the day you ask.",
    points: ["FIX 4.4 sessions", "REST + WebSocket", "Co-location", "Sandbox keys"],
  },
];

const ACCOUNTS = [
  { name: "Standard", deposit: "$250", spread: "from 1.0", commission: "None", note: "For traders finding their rhythm.", feature: false },
  { name: "Prime", deposit: "$10,000", spread: "from 0.2", commission: "$3.00 / lot", note: "Tighter pricing, credit facility unlocked.", feature: true },
  { name: "Raw Spread", deposit: "$25,000", spread: "from 0.0", commission: "$2.00 / lot", note: "Interbank pricing, passed through untouched.", feature: false },
  { name: "Islamic", deposit: "$1,000", spread: "from 1.2", commission: "None", note: "Swap-free, Shariah-compliant rollover.", feature: false },
];

const REVIEWS = [
  { quote: "The credit panel is the reason I moved my book here. I can see what the facility will fund before I size a position, not after the margin call.", who: "Adrian Chen", role: "Systematic FX · Singapore", score: "5.0" },
  { quote: "Withdrawals clear the same day, every time. After eleven years and six brokers, that is genuinely the whole review.", who: "Petra Lindqvist", role: "Prop desk · Stockholm", score: "5.0" },
  { quote: "They publish their fill statistics. Nobody publishes their fill statistics. I checked the slippage numbers against my own logs and they matched.", who: "Elena Duarte", role: "Discretionary macro · Toronto", score: "4.9" },
];

/* ------------------------------------------------------------------ */

function Stars({ n = 5 }) {
  return (
    <span className="stars" aria-label={`${n} out of 5`}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M6 .8 7.5 4l3.5.5-2.5 2.4.6 3.5L6 8.7 2.9 10.4l.6-3.5L1 4.5 4.5 4Z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export default function Landing() {
  const [tab, setTab] = useState("Forex");
  const [platform, setPlatform] = useState(0);
  const rows = SPREAD_TABS[tab];
  const active = PLATFORMS[platform];

  return (
    <div className="landing" id="top">
      <SiteNav />

      {/* ============================ HERO ============================ */}
      <section className="hero">
        <div className="shell hero__in">
          <div className="hero__copy">
            <Reveal className="hero__eyebrow eyebrow eyebrow--dot" delay={40}>
              Regulated multi-asset brokerage
            </Reveal>

            <Reveal as="h1" className="hero__title" delay={110}>
              The A–Z of trading,
              <br />
              run like an <em>institution</em>
            </Reveal>

            <Reveal as="p" className="hero__lede" delay={190}>
              Raw pricing from eleven liquidity providers, a margin credit facility
              that moves at the speed of your desk, and every balance reconciled
              nightly — so the number you read is the number you have.
            </Reveal>

            <Reveal className="hero__cta" delay={260}>
              <Link to="/login" className="btn btn--ember">
                Start trading now
                <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#spreads" className="btn btn--ghost">See live spreads</a>
            </Reveal>

            <Reveal className="hero__trust" delay={330}>
              <div className="hero__avatars" aria-hidden="true">
                {["#14130F", "#DC4B1E", "#4A473F", "#C9A227"].map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </div>
              <p>
                <strong className="num">180,412</strong> funded accounts ·{" "}
                <span className="hero__stars"><Stars /> 4.9 average</span>
              </p>
            </Reveal>
          </div>

          {/* Product visual — a live slice of the real dashboard */}
          <Reveal className="hero__panel" delay={200} y={34}>
            <div className="glass">
              <div className="glass__bar">
                <span className="eyebrow">EMPZ-004182 · Prime</span>
                <span className="badge badge--gain">▲ 12.4% MTD</span>
              </div>

              <ArcGauge value={148250} max={250000} label="Total equity">
                <strong className="gauge__value num">
                  <CountUp value={148250} format={(v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} duration={1400} />
                </strong>
              </ArcGauge>

              <div className="glass__grid">
                {[
                  { k: "Credit", v: "$148,250", d: [96, 101, 99, 108, 114, 121, 128, 137, 148], c: "#14130F" },
                  { k: "Withdraw", v: "$42,680", d: [21, 24, 23, 28, 31, 33, 36, 39, 42], c: "#1E7A4B" },
                  { k: "Outstanding", v: "$18,940", d: [9, 12, 15, 14, 17, 19, 21, 20, 18], c: "#C9A227" },
                  { k: "Loan", v: "$75,000", d: [120, 118, 112, 104, 99, 94, 84, 79, 75], c: "#DC4B1E" },
                ].map((c) => (
                  <div className="glass__cell" key={c.k}>
                    <span className="eyebrow">{c.k}</span>
                    <strong className="num">{c.v}</strong>
                    <Sparkline data={c.d} stroke={c.c} height={26} />
                  </div>
                ))}
              </div>
            </div>

            <div className="hero__float hero__float--a">
              <span className="eyebrow">Execution</span>
              <strong className="num">11<small>ms</small></strong>
            </div>
            <div className="hero__float hero__float--b">
              <span className="hero__floatdot" aria-hidden="true" />
              <div>
                <span className="eyebrow">Withdrawal cleared</span>
                <strong className="num">$12,000.00</strong>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================= STAT BAND ========================== */}
      <section className="statband">
        <div className="shell statband__in">
          {STATS.map((s, i) => (
            <Reveal className="statband__cell" key={s.label} delay={i * 80}>
              <strong className="statband__value num">{s.value}</strong>
              <span className="eyebrow">{s.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ========================== ABOUT ============================= */}
      <section className="about" id="about">
        <div className="shell about__in">
          <Reveal className="about__visual">
            <div className="phone">
              <div className="phone__notch" aria-hidden="true" />
              <div className="phone__screen">
                <div className="phone__top">
                  <span className="eyebrow">Portfolio</span>
                  <span className="badge badge--gain">▲ 2.1%</span>
                </div>
                <strong className="phone__big num">$97,326<small>.45</small></strong>
                <span className="eyebrow">Net liquidation value</span>
                <div className="phone__spark">
                  <Sparkline data={[42, 46, 44, 52, 58, 55, 63, 69, 66, 74, 79, 86]} stroke="#DC4B1E" height={104} />
                </div>

                <ul className="phone__risk">
                  {[
                    ["Low risk", 26, "#1E7A4B"],
                    ["Medium risk", 58, "#C9A227"],
                    ["High risk", 16, "#DC4B1E"],
                  ].map(([label, w, c]) => (
                    <li key={label}>
                      <span className="phone__riskdot" style={{ background: c }} />
                      <span>{label}</span>
                      <span className="phone__risktrack"><i style={{ width: `${w}%`, background: c }} /></span>
                      <span className="num">{w}%</span>
                    </li>
                  ))}
                </ul>

                <div className="phone__actions">
                  <span className="phone__act phone__act--fill">Deposit</span>
                  <span className="phone__act">Withdraw</span>
                </div>
              </div>
            </div>
            <div className="about__stamp">
              <span className="eyebrow">Since</span>
              <strong className="num">2011</strong>
            </div>
          </Reveal>

          <div className="about__copy">
            <Reveal className="eyebrow eyebrow--dot eyebrow--ember">About Farverde</Reveal>
            <Reveal as="h2" className="sect__title" delay={60}>
              Our reputation is<br />built on <em>experience</em>
            </Reveal>
            <Reveal as="p" className="sect__lede" delay={120}>
              Fifteen years of facilitating international payments, foreign exchange
              and margin credit for desks that cannot afford a bad fill.
            </Reveal>
            <Reveal delay={180}>
              <Accordion items={FAQ} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================== SPREADS ============================= */}
      <section className="spreads" id="spreads">
        <div className="shell">
          <Reveal className="sect__head sect__head--center">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Trade now</span>
            <h2 className="sect__title">Market spreads and swaps</h2>
            <p className="sect__lede">
              Live client sentiment and raw spreads, refreshed continuously. No markup, no dealing desk.
            </p>
          </Reveal>

          <Reveal className="tabs" delay={80}>
            <div className="tabs__list" role="tablist" aria-label="Asset class">
              {Object.keys(SPREAD_TABS).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={`tabs__tab${tab === t ? " is-active" : ""}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="sprtable" role="tabpanel">
              <div className="sprtable__head">
                <span className="eyebrow">Instrument</span>
                <span className="eyebrow sprtable__sent">Sellers / Buyers</span>
                <span className="eyebrow sprtable__num">Spread</span>
                <span />
              </div>
              {rows.map((r, i) => (
                <div className="sprtable__row" key={r.sub} style={{ animationDelay: `${i * 45}ms` }}>
                  <div className="sprtable__inst">
                    <span className="sprtable__flag" aria-hidden="true">{r.flag}</span>
                    <span>
                      <strong>{r.name}</strong>
                      <small className="num">{r.sub}</small>
                    </span>
                  </div>

                  <div className="sent">
                    <span className="sent__pct num sent__pct--sell">{r.sell}%</span>
                    <span className="sent__bar">
                      <i className="sent__sell" style={{ width: `${r.sell}%` }} />
                      <i className="sent__buy" style={{ width: `${100 - r.sell}%` }} />
                    </span>
                    <span className="sent__pct num sent__pct--buy">{100 - r.sell}%</span>
                  </div>

                  <span className="sprtable__num num">{r.spread}</span>
                  <Link to="/login" className="btn btn--ghost btn--sm sprtable__cta">Trade</Link>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======================= PLATFORMS (dark) ===================== */}
      <section className="platforms" id="platforms">
        <div className="shell">
          <Reveal className="sect__head sect__head--center">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Platforms</span>
            <h2 className="sect__title">Trade where you already think</h2>
          </Reveal>

          <div className="platforms__grid">
            <Reveal className="platforms__list" delay={60}>
              {PLATFORMS.map((p, i) => (
                <button
                  key={p.key}
                  className={`plat${platform === i ? " is-active" : ""}`}
                  onClick={() => setPlatform(i)}
                  aria-pressed={platform === i}
                >
                  <span className="plat__name">{p.key}</span>
                  <span className="plat__tag eyebrow">{p.tag}</span>
                  <span className="plat__arrow" aria-hidden="true">
                    <svg width="13" height="11" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
              ))}
            </Reveal>

            <Reveal className="platpanel" delay={140} key={active.key}>
              <div className="platpanel__head">
                <h3>{active.key}</h3>
                <span className="badge badge--flat">{active.tag}</span>
              </div>
              <p>{active.body}</p>
              <ul className="platpanel__points">
                {active.points.map((pt) => (
                  <li key={pt}>
                    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5.2 4.3 8.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {pt}
                  </li>
                ))}
              </ul>

              <div className="platpanel__chart">
                <div className="spread-mini">
                  <div className="spread-mini__head">
                    <span className="eyebrow">Market update</span>
                    <span className="badge badge--gain">▲ 0.63%</span>
                  </div>
                  <div className="bars">
                    {[38, 62, 45, 78, 55, 88, 70, 94, 66, 82, 58, 90].map((h, i) => (
                      <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 55}ms`, background: i % 3 === 2 ? "var(--ember)" : "rgba(245,243,238,.28)" }} />
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/login" className="btn btn--onCoal">
                Launch {active.key}
                <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ======================== ACCOUNTS ============================ */}
      <section className="accounts" id="accounts">
        <div className="shell">
          <Reveal className="sect__head">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Trading accounts</span>
            <h2 className="sect__title">Pick the desk that fits</h2>
          </Reveal>

          <div className="accounts__grid">
            {ACCOUNTS.map((a, i) => (
              <Reveal className={`acct${a.feature ? " acct--feature" : ""}`} key={a.name} delay={i * 80}>
                {a.feature && <span className="acct__ribbon eyebrow">Most chosen</span>}
                <h3 className="acct__name">{a.name}</h3>
                <p className="acct__note">{a.note}</p>
                <dl className="acct__specs">
                  <div><dt className="eyebrow">Min deposit</dt><dd className="num">{a.deposit}</dd></div>
                  <div><dt className="eyebrow">Spread</dt><dd className="num">{a.spread}</dd></div>
                  <div><dt className="eyebrow">Commission</dt><dd className="num">{a.commission}</dd></div>
                </dl>
                <Link to="/login" className={`btn btn--wide ${a.feature ? "btn--ember" : "btn--ghost"}`}>
                  Open {a.name}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= APP BAND =========================== */}
      <section className="appband">
        <div className="shell appband__in">
          <Reveal className="appband__copy">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Mobile</span>
            <h2 className="sect__title">Your desk, in your pocket</h2>
            <p className="sect__lede">
              Full order entry, credit panel and same-day withdrawals. Biometric
              login, and push alerts that fire on your levels, not ours.
            </p>
            <div className="appband__stores">
              {[
                ["App Store", "iOS 16+"],
                ["Google Play", "Android 11+"],
              ].map(([s, sub]) => (
                <a className="store" href="#top" key={s}>
                  <svg width="19" height="19" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.3"/><path d="M8 6l6 4-6 4V6Z" fill="currentColor"/></svg>
                  <span>
                    <small className="eyebrow">Download on</small>
                    <strong>{s}</strong>
                    <small className="store__sub num">{sub}</small>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal className="appband__stats" delay={120}>
            {[
              ["1M+", "Downloads"],
              ["5M+", "Orders / month"],
              ["18+", "Years operating"],
              ["24/7", "Desk support"],
            ].map(([v, l]) => (
              <div className="appband__stat" key={l}>
                <strong className="num">{v}</strong>
                <span className="eyebrow">{l}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ======================== TESTIMONIALS ======================== */}
      <section className="reviews" id="reviews">
        <div className="shell">
          <Reveal className="sect__head sect__head--center">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Love from users</span>
            <h2 className="sect__title">What the desks say</h2>
          </Reveal>

          <div className="reviews__grid">
            {REVIEWS.map((r, i) => (
              <Reveal className="review" key={r.who} delay={i * 90}>
                <div className="review__top">
                  <Stars />
                  <span className="num review__score">{r.score}</span>
                </div>
                <blockquote>{r.quote}</blockquote>
                <div className="review__who">
                  <span className="review__avatar" aria-hidden="true">{r.who.charAt(0)}</span>
                  <span>
                    <strong>{r.who}</strong>
                    <small>{r.role}</small>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================= */}
      <section className="finalcta">
        <div className="shell">
          <Reveal className="finalcta__in">
            <span className="eyebrow eyebrow--dot eyebrow--ember">Get started</span>
            <h2 className="finalcta__title">
              Four minutes to open.<br />Same day to trade.
            </h2>
            <div className="finalcta__actions">
              <Link to="/signup" className="btn btn--ember">
                Open an account
                <svg className="arr" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M1 5h9M6.5 1 10.5 5 6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/login" className="btn btn--ghost">Client sign-in</Link>
            </div>
            <p className="finalcta__fine num">
              Live accounts from $250 · Withdraw any cleared balance same day
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
