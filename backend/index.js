require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;

const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { Order } = require("./model/OrdersModel");
const { Watchlist } = require("./model/WatchlistModel");

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

app.use("/", authRoute);
app.use("/positions", positionsRoute);
app.use("/holdings", holdingsRoute);
app.use("/watchlist", watchlistRoute);
app.use("/orders", orderRoute);

app.post("/newOrder", async (req, res) => {
  let newOrder = new Order({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });
  newOrder.save();
  res.send("Order Saved");
});

app.delete("/delWatchlist/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid watchlist item ID");
  }

  try {
    const result = await Watchlist.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send("Watchlist item not found");
    }

    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).send("Error deleting watchlist item");
  }
});
app.delete("/orders/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid order ID");
  }

  try {
    const result = await Order.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).send("Order not found");
    }

    res.status(200).send("Order deleted successfully");
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send("Internal Server Error");
  }
});


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
