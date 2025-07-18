require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStr = require("passport-local").Strategy;
const http = require("http");
const WebSocket = require("ws"); // ✅ corrected casing

const app = express();
const server = http.createServer(app); // ✅ required for WS + HTTP
const wss = new WebSocket.Server({ server }); // ✅ WebSocket server

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URL || !JWT_SECRET) {
  console.error("Missing MONGO_URL or JWT_SECRET in .env");
  process.exit(1);
}

// ✅ Model and Routes
const User = require("./model/UserModel");
const orderRoute = require("./routes/OrdersRoute");
const authRoute = require("./routes/AuthRoutes");
const positionsRoute = require("./routes/PositionsRoute");
const holdingsRoute = require("./routes/HoldingsRoute");
const watchlistRoute = require("./routes/WatchlistRoute");
const apiRouter = require("./routes/apiRouter");
const fundRoute = require("./routes/fundsRoute");

// ✅ CORS
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

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
passport.use(new localStr({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ REST Routes
app.use("/auth", authRoute);
app.use("/positions", positionsRoute);
app.use("/holdings", holdingsRoute);
app.use("/watchlist", watchlistRoute);
app.use("/orders", orderRoute);
app.use("/stock", apiRouter);
app.use("/funds", fundRoute);

// ✅ MongoDB
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

// ✅ WebSocket Logic
const finnhubSocket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.LIVEPRICE_API_KEY}`);

finnhubSocket.on("open", () => {
  console.log("🔗 Connected to Finnhub WebSocket");
});

finnhubSocket.on("message", (data) => {
  console.log("💾 Finnhub →", data.toString());
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
});


wss.on("connection", (ws) => {
  console.log("🟢 Client connected to WebSocket");

  ws.on("message", (msg) => {
  try {
    const { type, symbol } = JSON.parse(msg);
    if (finnhubSocket.readyState !== WebSocket.OPEN) {
      console.warn(`⛔ Cannot forward ${type} for ${symbol}, finnhub not connected`);
      return;
    }

    if (type === "subscribe" && symbol) {
      console.log(`📡 Subscribing to ${symbol} on Finnhub`);
      finnhubSocket.send(JSON.stringify({ type: "subscribe", symbol }));
    } else if (type === "unsubscribe" && symbol) {
      console.log(`❎ Unsubscribing from ${symbol} on Finnhub`);
      finnhubSocket.send(JSON.stringify({ type: "unsubscribe", symbol }));
    }
  } catch (err) {
    console.error("⚠️ WebSocket message error:", err.message);
  }
});

});

// ✅ Start HTTP + WebSocket Server
server.listen(PORT, () => {
  console.log(`🚀 App + WebSocket running at http://localhost:${PORT}`);
});
