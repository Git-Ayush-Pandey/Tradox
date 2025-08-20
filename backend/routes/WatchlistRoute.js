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

  if (Object.keys(grouped).length === 0) {
    grouped["Watchlist 1"] = [];
  }

  res.json(grouped);
});

router.post("/create", isLoggedIn, async (req, res) => {
  const { listName } = req.body;
  const userId = req.user._id;

  if (!listName || listName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Watchlist name is required",
    });
  }

  try {
    const existing = await Watchlist.findOne({
      userId,
      listName: listName.trim(),
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Watchlist with this name already exists",
      });
    }

    res.status(201).json({
      success: true,
      message: `Watchlist '${listName.trim()}' created successfully`,
      listName: listName.trim(),
    });
  } catch (err) {
    console.error("Error creating watchlist:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating watchlist",
    });
  }
});

router.delete("/delete-list/:listName", isLoggedIn, async (req, res) => {
  const { listName } = req.params;
  const userId = req.user._id;

  if (!listName || listName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Watchlist name is required",
    });
  }

  try {
    const allUserWatchlists = await Watchlist.find({ userId });
    const uniqueListNames = [
      ...new Set(allUserWatchlists.map((item) => item.listName)),
    ];

    if (uniqueListNames.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your only watchlist",
      });
    }

    const deleteResult = await Watchlist.deleteMany({
      userId,
      listName: listName.trim(),
    });

    res.status(200).json({
      success: true,
      message: `Watchlist '${listName.trim()}' deleted successfully`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting watchlist:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting watchlist",
    });
  }
});

router.post("/add", isLoggedIn, async (req, res) => {
  const {
    name,
    symbol,
    price,
    percent,
    isDown,
    listName = "Watchlist 1",
  } = req.body;
  const userId = req.user._id;

  if (
    !name ||
    !symbol ||
    price === undefined ||
    !percent ||
    isDown === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    const existing = await Watchlist.findOne({ symbol, userId, listName });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Stock already in watchlist",
      });
    }

    const newItem = new Watchlist({
      name,
      symbol,
      price,
      percent,
      isDown,
      userId,
      listName,
    });

    const newStock = await newItem.save();
    res.status(201).json({
      success: true,
      message: "Added to watchlist",
      item: newStock,
    });
  } catch (err) {
    console.error("Error adding to watchlist:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid stock ID" });
  }

  try {
    const deleted = await Watchlist.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Stock not found" });
    }

    res.status(200).json({ success: true, message: "Stock deleted" });
  } catch (err) {
    console.error("Error deleting stock:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.put("/rename", isLoggedIn, async (req, res) => {
  const { oldName, newName } = req.body;
  const userId = req.user._id;

  if (!oldName || !newName || !newName.trim()) {
    return res.status(400).json({
      success: false,
      message: "Old and new watchlist names are required",
    });
  }

  if (oldName.trim() === newName.trim()) {
    return res.status(400).json({
      success: false,
      message: "New name must be different",
    });
  }

  try {
    const oldExists = await Watchlist.findOne({
      userId,
      listName: oldName.trim(),
    });
    if (!oldExists) {
      return res.status(404).json({
        success: false,
        message: "Old watchlist not found",
      });
    }

    const newExists = await Watchlist.findOne({
      userId,
      listName: newName.trim(),
    });
    if (newExists) {
      return res.status(409).json({
        success: false,
        message: "A watchlist with this name already exists",
      });
    }

    const updateResult = await Watchlist.updateMany(
      { userId, listName: oldName.trim() },
      { $set: { listName: newName.trim() } }
    );

    res.status(200).json({
      success: true,
      message: `Watchlist renamed from '${oldName}' to '${newName}'`,
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (err) {
    console.error("Error renaming watchlist:", err);
    res.status(500).json({
      success: false,
      message: "Server error while renaming watchlist",
    });
  }
});

module.exports = router;
