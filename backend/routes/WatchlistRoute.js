const router = require("express").Router();
const mongoose = require("mongoose");
const { Watchlist } = require("../model/WatchlistModel");
const {isLoggedIn} = require("../middleware")

router.get("/", isLoggedIn, async (req, res) => {
  let allWatchlist = await Watchlist.find({});
  res.json(allWatchlist);
});

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid watchlist item ID");
  }
  try {
    const result = await Watchlist.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send("Watchlist item not found");
    }
    req.flash("Watchlist Deleted successfully");
    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).send("Error deleting watchlist item");
  }
});

module.exports = router;
