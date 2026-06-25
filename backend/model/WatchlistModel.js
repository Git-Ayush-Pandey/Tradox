const { model, Schema } = require("mongoose");

const WatchListModel = new Schema(
  {
    symbol: String,
    name: String,
    // price/percent/isDown stored at add-time; used as fallback before live prices arrive
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
  },
  { timestamps: true }
);

// FIX: Compound index for userId + listName (used by watchlist create/rename/delete)
WatchListModel.index({ userId: 1 });
WatchListModel.index({ userId: 1, listName: 1 });
WatchListModel.index({ userId: 1, symbol: 1, listName: 1 });

const Watchlist = new model("Watchlist", WatchListModel);
module.exports = { Watchlist };
