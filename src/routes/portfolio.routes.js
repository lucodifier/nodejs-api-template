const router = require("express-promise-router")();
const controller = require("../controllers/portfolio.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/portfolio", controller.list);

module.exports = router;
