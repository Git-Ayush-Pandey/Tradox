const { getOrders, newOrder, delOrder } = require("../controller/OrdersController");
const router = require("express").Router();

router.get("/", getOrders);
router.delete("/delete/:id", delOrder )
router.post("/new",newOrder)
module.exports = router;
