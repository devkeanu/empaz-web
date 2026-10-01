# empaz-web

The Farverde Markets frontend: public site, client dashboard, and the admin
control desk that sets the numbers the client sees.

The API is a separate project — **empaz-api** — deployed separately.

Built with **React 19 + Vite**, React Router, and hand-rolled SVG charts.
No UI kit and no chart library — every surface is written to the same
design system.

---

## Running it

The project needs Node 20+ (Node 18 will not start Vite 8):

```bash
nvm use 22.22.1
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle in dist/
npm run preview      # serve the built bundle
```

## Accounts and sign-in

Accounts live in the API's database. There are no built-in credentials: the
first admin is created by the API's migration, and every client account is
created through the signup page here.

| Route     | Who          | What it does                                           |
| --------- | ------------ | ------------------------------------------------------ |
| `/signup` | public       | Opens a client account. Created as **Pending**.        |
| `/login`  | public       | Email + password, exchanged for a session cookie.      |

A new client can sign in immediately but sees a locked dashboard until an
admin approves them. The Control desk flags pending accounts with a **New**
badge and shows an **Approve account** banner; approving sets the status to
Active and writes an `Account approved` row to the audit trail.

## The four balances

The client dashboard is built around them, and the admin panel exists to set them:

- **Credit balance** — settled funds available to open positions
- **Withdraw balance** — cleared for payout
- **Outstanding balance** — unsettled trades and fees
- **Loan balance** — drawn against the margin credit facility

### What the admin can do

Sign in as the admin and you land on **Control desk**:

- Pick a client from the cards at the top; pending accounts carry a **New** flag.
- **Approve account** — activate a pending client so their dashboard unlocks.
- **Dashboard balances** — type any of the four amounts, or nudge them with the
  ±1k / ±5k / ±10k keys. The panel shows a live-vs-draft diff per field and a
  projected net equity, and stays disabled until something actually changed.
  **Push to dashboard** commits it.
- **Post a movement** — add a ledger row (negative amount for a debit), or apply
  the amount straight to one of the four balances.
- **Account settings** — status, tier, currency, leverage, the credit facility
  ceiling behind the gauge, and a notice banner shown to the client.
- **Audit trail** — every change made from the desk, with who and when.

Each committed change appends a point to that balance's 12-month series, so the
sparklines and the equity curve move with it.

## The API

This app is a pure frontend. Every account, balance and ledger row comes from
**empaz-api**, deployed separately. Point at it with one variable:

```bash
cp .env.example .env
# VITE_API_URL="http://localhost:8080"
```

Vite inlines `VITE_API_URL` at build time, so changing it needs a rebuild, and
anything in a `VITE_` variable is public — never put a secret there.

With no API reachable, the UI still renders but every call fails with
"Cannot reach the server".

### Auth

The API lives on a different host, so a session cookie would be a third-party
cookie and Safari and Firefox would drop it. The app holds a short-lived
**access token in memory** and a **refresh token in `localStorage`**; on boot,
and on any 401, it swaps the refresh token for a new pair and retries once.
Concurrent calls share a single refresh, so a burst of 401s cannot rotate the
token out from under itself.

Signing out revokes the refresh token server-side before clearing it locally.

## Deploying

Static build, so any static host works — Vercel, Netlify, Cloudflare Pages, S3.

```bash
npm run build      # -> dist/
```

Set `VITE_API_URL` in the host's build environment to the deployed API's URL,
then add that frontend origin to the API's `CORS_ORIGINS` or every request
fails preflight.

`vercel.json` rewrites every path to `index.html` so client-side routes such as
`/signup` survive a hard refresh. On another host, configure the same SPA
fallback.

## Design

Palette and type come from the Brickwise reference; the landing page follows the
ForTradex section order.

- **Ground** warm off-white `#F2F0EB`, ink `#14130F`, a single ember accent
  `#DC4B1E`, with market green/red reserved for prices and deltas only.
- **Type** Archivo for display, Instrument Sans for text, IBM Plex Mono for
  every number, label and eyebrow. All figures are tabular.
- **Structure** hairline rules instead of shadows; sections divide edge to edge.
- Tokens live in `src/styles/tokens.css` — change the palette there and the
  whole app follows.

Dark bands (platforms, footer, sidebar, login aside) are deliberate contrast
moments, not a dark theme.

## Layout

```
src/
  components/        nav, footer, ticker, accordion, count-up, reveal
    charts/          Sparkline, ArcGauge, AreaChart, AllocationBar (all SVG)
  data/seed.js       balance vocabulary + ticker quotes (no accounts)
  layouts/AppShell   sidebar + route guards
  pages/             Landing, Login, Signup, Dashboard, Ledger, Admin
  store/             DataContext (API-backed state), api.js, format helpers
  styles/            tokens, base, landing, app
```

## Routes

| Path                 | Who        |
| -------------------- | ---------- |
| `/`                  | public     |
| `/login`             | public     |
| `/signup`            | public     |
| `/dashboard`         | signed in  |
| `/dashboard/ledger`  | signed in  |
| `/admin`             | admin only |

A client hitting `/admin` is redirected to their dashboard; a signed-out visitor
goes to `/login`. A client whose account is still **Pending** reaches the
dashboard but sees the review notice instead of their balances.
