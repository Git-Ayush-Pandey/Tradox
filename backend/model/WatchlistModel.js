const { model } = require("mongoose");
const { Schema } = require("mongoose");

const WatchListModel = new Schema({
  name: String,
  price: Number,
  percent: String,
  isDown: Boolean,
});

const Watchlist = new model("Watchlist", WatchListModel);

module.exports = { Watchlist };
