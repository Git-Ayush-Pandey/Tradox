const { model } = require("mongoose");
const { Schema } = require("mongoose");

const WatchListModel = new Schema({
  name: String,
  price: Number,
  percent: String,
  isDown: Boolean,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  listName: {
    type: String,
    default: "Watchlist 1",
  },
});
const Watchlist = new model("Watchlist", WatchListModel);

module.exports = { Watchlist };
