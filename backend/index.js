require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStr = require("passport-local").Strategy;

const app = express();
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
const apiRouter = require("./routes/apiRouter")
const fundRoute = require("./routes/fundsRoute")
// app.get('/addHoldings', async(req,res)=>{
//   let tempHoldings = [
//   {
//     name: "INFY",
//     price: 1555.45,
//     percent: "-1.60%",
//     isDown: true,
//   },
// ];
//   tempHoldings.forEach((item)=>{
//     let newHolding = new Watchlist({
//       name: item.name,
//       price: item.price,
//       percent: item.percent,
//       isDown: item.isDown
//     })
//     newHolding.save()
//   })
//   res.send("done")
// })
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

app.listen(PORT, () => {
  console.log("App Started!");
  console.log("backend Running at port 3002");
});
