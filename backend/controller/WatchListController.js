const { Watchlist } = require("../model/WatchlistModel");

module.exports.getWatchlist = async (req, res) => {
  let allWatchlist = await Watchlist.find({});
  res.json(allWatchlist);
};
