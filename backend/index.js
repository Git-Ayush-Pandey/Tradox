require("dotenv").config();
require("./util/orderCleaner");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStr = require("passport-local").Strategy;
const http = require("http");
const WebSocket = require("ws");
const cron = require("node-cron");
const { autoSquareOffIntraday } = require("./util/autoSquareOff");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

const PORT = process.env.PORT || 4000;
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

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
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

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
passport.use(new localStr({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/auth", authRoute);
app.use("/positions", positionsRoute);
app.use("/holdings", holdingsRoute);
app.use("/watchlist", watchlistRoute);
app.use("/orders", orderRoute);
app.use("/stock", apiRouter);
app.use("/funds", fundRoute);
app.use("/otp", otpRoute);

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};
connectToMongoDB();

cron.schedule("50 0 * * 1-5", async () => {
  console.log("🚀 Running auto square-off job at 12:50 AM IST...");
  try {
    await autoSquareOffIntraday();
    console.log("✅ Auto square-off completed.");
  } catch (err) {
    console.error("❌ Auto square-off error:", err);
  }
});

const finnhubSocket = new WebSocket(
  `wss://ws.finnhub.io?token=${process.env.LIVEPRICE_API_KEY}`
);

finnhubSocket.on("open", () => {
  console.log("🔗 Connected to Finnhub WebSocket");
});

// Broadcast Finnhub trade data to all connected WebSocket clients
finnhubSocket.on("message", (data) => {
  const parsed = JSON.parse(data);
  if (parsed.type === "trade" && parsed.data) {
    const message = JSON.stringify({ type: "trade", data: parsed.data });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});

// 🆕 Symbol subscription map: { symbol: Set of client sockets }
// ... all your requires & app setup remains the same

// Symbol subscription map: { symbol: Set<WebSocket> }
const symbolSubscriptions = {};

wss.on("connection", (ws) => {
  console.log("🟢 Client connected to WebSocket");

  ws.subscribedSymbols = new Set();

  ws.on("message", (msg) => {
    let parsed;
    try {
      parsed = JSON.parse(msg);
    } catch (err) {
      console.error("⚠️ Invalid JSON from client:", err.message);
      return;
    }

    const { type, symbol } = parsed;
    if (!type || !symbol || typeof symbol !== "string") return;

    const upperSymbol = symbol.toUpperCase();

    if (type === "subscribe") {
      if (ws.subscribedSymbols.has(upperSymbol)) return; // ✅ already subscribed

      ws.subscribedSymbols.add(upperSymbol);

      if (!symbolSubscriptions[upperSymbol]) {
        symbolSubscriptions[upperSymbol] = new Set();
      }

      const isFirst = symbolSubscriptions[upperSymbol].size === 0;
      symbolSubscriptions[upperSymbol].add(ws);

      if (isFirst && finnhubSocket.readyState === WebSocket.OPEN) {
        finnhubSocket.send(
          JSON.stringify({ type: "subscribe", symbol: upperSymbol })
        );
      }
    } else if (type === "unsubscribe") {
      if (!ws.subscribedSymbols.has(upperSymbol)) return;

      ws.subscribedSymbols.delete(upperSymbol);
      symbolSubscriptions[upperSymbol]?.delete(ws);

      if (symbolSubscriptions[upperSymbol]?.size === 0) {
        finnhubSocket.send(
          JSON.stringify({ type: "unsubscribe", symbol: upperSymbol })
        );
        delete symbolSubscriptions[upperSymbol];
      }
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");

    for (const symbol of ws.subscribedSymbols) {
      symbolSubscriptions[symbol]?.delete(ws);

      if (symbolSubscriptions[symbol]?.size === 0) {
        finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
        delete symbolSubscriptions[symbol];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 App + WebSocket running at http://localhost:${PORT}`);
});
