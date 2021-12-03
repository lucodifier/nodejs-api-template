const router = require("express-promise-router")();
const controller = require("../controllers/investments.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/investments", controller.list);
router.post("/investments", controller.create);
router.post("/investments/sell", controller.sell);

router.get("/investments/portfolio", controller.portfolio);
router.get("/investments/follow_up", controller.follow_up);
router.post("/investments/upload", controller.upload);
router.post("/investments/remove", controller.remove);

module.exports = router;
