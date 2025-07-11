require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStr = require("passport-local").Strategy;

const User = require("./model/UserModel");
const orderRoute = require("./routes/OrdersRoute");
const authRoute = require("./routes/AuthRoutes");
const positionsRoute = require("./routes/PositionsRoute");
const holdingsRoute = require("./routes/HoldingsRoute");
const watchlistRoute = require("./routes/WatchlistRoute");
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
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

app.use(passport.initialize());
passport.use(new localStr({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", authRoute);
app.use("/positions", positionsRoute);
app.use("/holdings", holdingsRoute);
app.use("/watchlist", watchlistRoute);
app.use("/orders", orderRoute);

async function main() {
  if (!url) {
    console.error("ATLASDB_URL is not defined in .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}
main();

app.listen(PORT, () => {
  console.log("App Started!");
  console.log("backend Running at port 3002");
});
