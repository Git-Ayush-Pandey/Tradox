require("dotenv").config();

const registerCronJobs = require("./util/cronJobs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStr = require("passport-local").Strategy;
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL || !JWT_SECRET) {
  console.error("Missing MONGO_URL or JWT_SECRET in .env");
  process.exit(1);
}

const User = require("./model/UserModel");
const orderRoute = require("./routes/OrdersRoute");
const authRoute = require("./routes/AuthRoutes");
const positionsRoute = require("./routes/PositionsRoute");
const holdingsRoute = require("./routes/HoldingsRoute");
const watchlistRoute = require("./routes/WatchlistRoute");
const apiRouter = require("./routes/apiRouter");
const fundRoute = require("./routes/fundsRoute");
const otpRoute = require("./routes/otpRoute");

// FIX: ALLOWED_ORIGINS null guard — prevents crash when env var is missing
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// FIX: Simple request logger (replaces morgan for zero extra dependency)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
passport.use(new localStr({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FIX: Health-check endpoint for deployment probes
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoute);
app.use("/positions", positionsRoute);
app.use("/holdings", holdingsRoute);
app.use("/watchlist", watchlistRoute);
app.use("/orders", orderRoute);
app.use("/stock", apiRouter);
app.use("/funds", fundRoute);
app.use("/otp", otpRoute);

// FIX: Global error handler — returns structured JSON instead of HTML error page
// Must be registered after all other routes/middleware
app.use((err, req, res, _next) => {
  console.error("[Global Error]", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
});

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
connectToMongoDB();

registerCronJobs();

// FIX: Finnhub WebSocket with reconnect logic
const symbolSubscriptions = {};

function createFinnhubSocket() {
  const finnhubSocket = new WebSocket(
    `wss://ws.finnhub.io?token=${process.env.LIVEPRICE_API_KEY}`
  );

  finnhubSocket.on("open", () => {
    console.log("Connected to Finnhub WebSocket");
    // Re-subscribe to all active symbols after reconnect
    const symbols = Object.keys(symbolSubscriptions);
    if (symbols.length > 0) {
      symbols.forEach((sym) => {
        finnhubSocket.send(JSON.stringify({ type: "subscribe", symbol: sym }));
      });
    }
  });

  // FIX: Per-symbol filtering — only forward to clients subscribed to that symbol
  finnhubSocket.on("message", (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "trade" && parsed.data) {
        parsed.data.forEach((trade) => {
          const symbol = trade.s?.toUpperCase();
          if (!symbol) return;
          const subscribers = symbolSubscriptions[symbol];
          if (!subscribers || subscribers.size === 0) return;
          const message = JSON.stringify({ type: "trade", data: [trade] });
          subscribers.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        });
      }
    } catch (err) {
      console.error("Finnhub message parse error:", err.message);
    }
  });

  finnhubSocket.on("error", (err) => {
    console.error("Finnhub WebSocket error:", err.message);
  });

  // FIX: Reconnect on unexpected close
  finnhubSocket.on("close", (code, reason) => {
    console.warn(`Finnhub WebSocket closed (${code}): ${reason}. Reconnecting in 5s…`);
    setTimeout(() => {
      global._finnhubSocket = createFinnhubSocket();
    }, 5000);
  });

  return finnhubSocket;
}

global._finnhubSocket = createFinnhubSocket();

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket");
  ws.subscribedSymbols = new Set();

  ws.on("message", (msg) => {
    let parsed;
    try {
      parsed = JSON.parse(msg);
    } catch (err) {
      console.error("Invalid JSON from client:", err.message);
      return;
    }

    const { type, symbol } = parsed;
    if (!type || !symbol || typeof symbol !== "string") return;

    const upperSymbol = symbol.toUpperCase();
    const finnhubSocket = global._finnhubSocket;

    if (type === "subscribe") {
      if (ws.subscribedSymbols.has(upperSymbol)) return;

      ws.subscribedSymbols.add(upperSymbol);

      if (!symbolSubscriptions[upperSymbol]) {
        symbolSubscriptions[upperSymbol] = new Set();
      }

      const isFirst = symbolSubscriptions[upperSymbol].size === 0;
      symbolSubscriptions[upperSymbol].add(ws);

      if (isFirst && finnhubSocket && finnhubSocket.readyState === WebSocket.OPEN) {
        finnhubSocket.send(
          JSON.stringify({ type: "subscribe", symbol: upperSymbol })
        );
      }
    } else if (type === "unsubscribe") {
      if (!ws.subscribedSymbols.has(upperSymbol)) return;

      ws.subscribedSymbols.delete(upperSymbol);
      symbolSubscriptions[upperSymbol]?.delete(ws);

      if (symbolSubscriptions[upperSymbol]?.size === 0) {
        delete symbolSubscriptions[upperSymbol];
        const finnhub = global._finnhubSocket;
        if (finnhub && finnhub.readyState === WebSocket.OPEN) {
          finnhub.send(
            JSON.stringify({ type: "unsubscribe", symbol: upperSymbol })
          );
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");

    for (const symbol of ws.subscribedSymbols) {
      symbolSubscriptions[symbol]?.delete(ws);

      if (symbolSubscriptions[symbol]?.size === 0) {
        delete symbolSubscriptions[symbol];
        const finnhub = global._finnhubSocket;
        if (finnhub && finnhub.readyState === WebSocket.OPEN) {
          finnhub.send(JSON.stringify({ type: "unsubscribe", symbol }));
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`App + WebSocket running at http://localhost:${PORT}`);
});
