const router = require("express-promise-router")();
const controller = require("../controllers/account.category.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/category", controller.list);
router.post("/category", controller.create);

module.exports = router;
