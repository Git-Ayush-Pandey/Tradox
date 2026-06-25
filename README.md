# Tradox — Stock Trading Simulation Platform

A full-stack paper-trading platform that simulates real brokerage mechanics end-to-end: limit order placement and execution, margin accounting, holdings and positions tracking, multi-watchlist management, and real-time price streaming via WebSocket.

Built with React 19, Node.js/Express 5, MongoDB, and WebSockets — inspired by Zerodha Kite.

---

## What Makes This Project Different

Most trading demos show a price chart and a buy button. Tradox implements the mechanics underneath:

- **Atomic order execution** — `findOneAndUpdate({ executed: false })` prevents double-execution under concurrent requests, the same pattern used in production order management systems
- **WebSocket fan-out** — the backend maintains a single upstream connection to Finnhub and fans out price data to per-symbol subscriber sets, so 100 clients watching AAPL share one upstream subscription
- **Fund accounting state machine** — available margin is reserved when an order is placed, released on cancellation, and settled on execution; realized P&L is computed from average cost basis on each SELL
- **Automated square-off** — a `node-cron` job closes all open intraday positions at 15:25 IST using MongoDB transactions, with a non-transactional fallback for standalone environments
- **OTP verification** — SHA-256 hashed, single-use, rate-limited (5 attempts per 10-minute window), with replay protection

---

## Architecture

```
┌─────────────────┐      ┌──────────────────────────────────────────┐
│  Frontend        │      │               Backend                   │
│  React 19        │─────▶│  Express 5 · Mongoose 8 · ws · cron     │
│  Port 3000       │      │  Port 5000                               │
│                  │      └──────────────────┬───────────────────────┘
│  Landing page    │                         │
│  Signup / Login  │                         │  MongoDB Atlas
│  OTP flow        │      ┌──────────────────┘  Users · Orders
└─────────────────┘      │                     Holdings · Positions
                          │                     Watchlists · Funds
┌─────────────────┐       │
│  Dashboard       │       │
│  React 19        │──────▶  REST API + WebSocket (/ws)
│  Port 3001       │
│                  │      Finnhub WebSocket
│  Trading UI      │      ──────────────────▶ Backend ──▶ Dashboard clients
│  Watchlist       │      (upstream price feed)   (per-symbol fan-out)
│  Analytics       │
└─────────────────┘
```

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React 19, React Router 7, Bootstrap 5 | Landing pages, Signup/Login, OTP verification |
| Dashboard | React 19, MUI v7, Recharts, Chart.js | Trading UI, Watchlist, Portfolio, Analytics |
| Backend | Express 5, Mongoose 8, `ws`, `node-cron` | REST API, WebSocket relay, scheduled jobs |
| Database | MongoDB Atlas | All persistent state |
| Real-time | Finnhub WS → Backend → Dashboard clients | Live price streaming |

---

## Key Features

**Authentication**
- OTP-verified signup (email + phone) with SHA-256 hashed storage and replay protection
- JWT in `httpOnly` cookies — `SameSite=lax` in development, `SameSite=none; Secure` in production
- 7-day session with backend token verification on every dashboard load

**Trading**
- Place limit BUY and SELL orders (Delivery or Intraday)
- Orders execute automatically when live price meets the limit — debounced to prevent excessive API calls
- Edit or cancel pending orders; funds adjust correctly on each action
- Atomic execution guard using `findOneAndUpdate` to prevent race conditions

**Portfolio**
- Holdings (long-term) and Positions (intraday) computed from executed orders
- Average cost basis, unrealized P&L, realized P&L, day change — all derived from live prices
- Funds dashboard with available margin, used margin, exposure, and collateral breakdown

**Watchlist**
- Multiple named watchlists with full CRUD (create, rename, delete)
- Symbol search via Finnhub API
- Per-symbol live price updates via WebSocket subscription management

**Real-time Prices**
- Backend proxies Finnhub WebSocket — API key never exposed to the browser
- Per-symbol fan-out: only one upstream subscription per symbol regardless of how many clients watch it
- Reconnect with exponential backoff; disconnection banner in the dashboard when live data is unavailable

**Automation**
- Auto square-off cron at 15:25 IST (Mon–Fri) — closes all open intraday positions at last traded price
- Pending orders cancelled at 15:35 IST; executed orders cleaned up nightly
- MongoDB transaction support with non-transactional fallback

**Analytics**
- TradingView chart widget per symbol
- Finnhub fundamentals and recent news in the analytics window
- Investment bar chart and portfolio composition

---

## Project Structure

```
Tradox/
├── backend/
│   ├── index.js          # App entry, WebSocket server, Finnhub relay
│   ├── middleware.js      # JWT authentication middleware
│   ├── model/            # Mongoose schemas (User, Order, Holding, Position, Watchlist, Fund)
│   ├── routes/           # REST route handlers (auth, orders, holdings, positions, watchlist, funds, otp)
│   └── util/             # Cron jobs, OTP logic, fund accounting, token generation
├── dashboard/
│   └── src/
│       ├── components/   # UI: Holdings, Positions, Orders, Watchlist, Charts, Windows
│       ├── contexts/     # GeneralContext (portfolio state), LivePriceContext (WebSocket)
│       ├── hooks/        # api.js (axios layer), useWatchlist, isMarketOpen
│       └── routes/       # ProtectedRoute
└── frontend/
    └── src/
        └── landing_page/ # Home, Pricing, Products, About, Support, Signup, Login
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/cloud/atlas))
- [Finnhub API key](https://finnhub.io/) (free tier supports live prices and search)

### Setup

```bash
# 1. Clone
git clone https://github.com/your-username/tradox.git
cd tradox

# 2. Backend
cd backend
cp .env.example .env    # fill in MONGO_URL, JWT_SECRET, Finnhub keys
npm install
npm run dev             # starts on port 5000

# 3. Dashboard
cd ../dashboard
cp .env.example .env
npm install
npm start               # starts on port 3001

# 4. Frontend
cd ../frontend
cp .env.example .env
npm install
npm start               # starts on port 3000
```

### Environment Variables

**`backend/.env`**
```env
PORT=5000
MONGO_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tradox
JWT_SECRET=your_long_random_secret_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LIVEPRICE_API_KEY=your_finnhub_api_key
SEARCH_API_KEY=your_finnhub_api_key
NODE_ENV=development

# Optional — OTP email delivery (nodemailer)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Optional — OTP SMS (MSG91)
MSG91_AUTH_KEY=
MSG91_WHATSAPP_NUMBER=
MSG91_NAMESPACE=
MSG91_TEMPLATE_NAME=otptemplate
MSG91_TEMPLATE_LANG=en_US
```

**`dashboard/.env`**
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=ws://localhost:5000/ws
REACT_APP_LOGOUT_REDIRECT_URL=http://localhost:3000/login
PORT=3001
```

**`frontend/.env`**
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_DASHBOARD_URL=http://localhost:3001
PORT=3000
```

---

## Technical Decisions

**Why a backend WebSocket relay instead of connecting the dashboard directly to Finnhub?**
Direct browser connections would expose the API key in client-side code. The backend acts as a proxy — it holds one authenticated upstream connection and routes price updates to subscribed clients, while also allowing per-symbol fan-out so N clients watching the same stock share one upstream subscription.

**Why `findOneAndUpdate({ executed: false })` for order execution?**
A `findById` → check → update pattern has a race condition: two concurrent requests both read `executed: false` and both proceed. Using MongoDB's atomic update with a conditional filter ensures only one request succeeds — the second receives `null` and returns a 400.

**Why is order matching on the client instead of the server?**
A known trade-off. Client-side matching avoids a persistent background process for a simulation platform, but means orders only execute while the browser is open. Server-side matching via a job queue (e.g., BullMQ) would be the production solution.

**Why `SameSite=lax` in development and `SameSite=none; Secure` in production?**
`SameSite=none` requires `Secure=true`, which requires HTTPS — unavailable on localhost. `SameSite=lax` permits cross-port same-host requests (3000 → 5000), which is the development scenario. Switching on `NODE_ENV` handles both correctly.

---

## Known Limitations

| Limitation | Production Solution |
|---|---|
| In-memory OTP store — lost on restart | MongoDB TTL collection or Redis |
| Client-side order matching — browser must be open | Server-side job queue (BullMQ, etc.) |
| No rate limiting on auth endpoints | `express-rate-limit` or API gateway |
| OTP delivery stubbed in production | Wire in nodemailer / MSG91 |
| No TypeScript | Gradual migration via JSDoc types or full TS rewrite |
| No test suite | Jest (backend), React Testing Library (dashboard) |

---

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, React Router 7, Bootstrap 5, Axios |
| **Dashboard** | React 19, MUI v7, Recharts, Chart.js, lightweight-charts |
| **Backend** | Node.js, Express 5, Mongoose 8, `ws`, `node-cron`, `jsonwebtoken`, `passport-local-mongoose` |
| **Database** | MongoDB Atlas |
| **External APIs** | Finnhub (live prices, search, fundamentals, news) |