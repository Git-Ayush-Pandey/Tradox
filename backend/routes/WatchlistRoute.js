const { getWatchlist, delWatchlist } = require("../controller/WatchListController");
const router = require("express").Router();

router.get("/", getWatchlist);
router.delete("/delete/:id", delWatchlist)
module.exports = router;
