require("dotenv").config();

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
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3002;
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
const otpRoute = require("./routes/otpRoute")

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
app.use("/otp", otpRoute)

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

const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.LIVEPRICE_API_KEY}`);

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
const symbolSubscriptions = {};

wss.on("connection", (ws) => {
  console.log("🟢 Client connected to WebSocket");

  // Keep track of what symbols this client is subscribed to
  ws.subscribedSymbols = new Set();

  ws.on("message", (msg) => {
    try {
      const { type, symbol } = JSON.parse(msg);
      if (!symbol || finnhubSocket.readyState !== WebSocket.OPEN) return;

      // Subscribe logic
      if (type === "subscribe") {
        if (!ws.subscribedSymbols.has(symbol)) {
          ws.subscribedSymbols.add(symbol);

          if (!symbolSubscriptions[symbol]) {
            symbolSubscriptions[symbol] = new Set();
          }

          const isFirstSubscriber = symbolSubscriptions[symbol].size === 0;
          symbolSubscriptions[symbol].add(ws);

          if (isFirstSubscriber) {
            console.log(`📡 Subscribing to ${symbol} on Finnhub`);
            finnhubSocket.send(JSON.stringify({ type: "subscribe", symbol }));
          }
        }
      }

      // Unsubscribe logic
      else if (type === "unsubscribe") {
        if (ws.subscribedSymbols.has(symbol)) {
          ws.subscribedSymbols.delete(symbol);
          symbolSubscriptions[symbol]?.delete(ws);

          const isLastSubscriber = symbolSubscriptions[symbol]?.size === 0;
          if (isLastSubscriber) {
            console.log(`❎ Unsubscribing from ${symbol} on Finnhub`);
            finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
            delete symbolSubscriptions[symbol];
          }
        }
      }
    } catch (err) {
      console.error("⚠️ WebSocket message error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");

    // Cleanup: remove this client from all symbol subscriptions
    for (const symbol of ws.subscribedSymbols) {
      symbolSubscriptions[symbol]?.delete(ws);

      if (symbolSubscriptions[symbol]?.size === 0) {
        console.log(`❎ Unsubscribing from ${symbol} (client disconnect)`);
        finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
        delete symbolSubscriptions[symbol];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 App + WebSocket running at http://localhost:${PORT}`);
});
