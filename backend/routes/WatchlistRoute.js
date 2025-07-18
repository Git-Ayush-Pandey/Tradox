const router = require("express").Router();
const mongoose = require("mongoose");
const { Watchlist } = require("../model/WatchlistModel");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const all = await Watchlist.find({ userId });
  const grouped = {};
  all.forEach((item) => {
    const list = item.listName || "Watchlist 1";
    if (!grouped[list]) grouped[list] = [];
    grouped[list].push(item);
  });

  res.json(grouped);
});

router.post("/add", isLoggedIn, async (req, res) => {
  const { name, price, percent, isDown, listName = "Watchlist_1" } = req.body;
  const userId = req.user._id;

  if (!name || price === undefined || !percent || isDown === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  try {
    const existing = await Watchlist.findOne({ name, userId, listName });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Stock already in watchlist" });
    }
    const newItem = new Watchlist({
      name,
      price,
      percent,
      isDown,
      userId,
      listName,
    });
    await newItem.save();
    res
      .status(201)
      .json({ success: true, message: "Added to watchlist", item: newItem });
  } catch (err) {
    console.error("Error adding to watchlist:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid watchlist item ID");
  }
  try {
    const result = await Watchlist.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res.status(404).send("Watchlist item not found or not authorized");
    }
    res.status(200).send("Deleted successfully");
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).send("Error deleting watchlist item");
  }
});

module.exports = router;
