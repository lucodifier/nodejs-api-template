const router = require("express-promise-router")();
const controller = require("../controllers/account.transactions.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/transactions", controller.list);
router.get("/transactions/accounts/:accounts", controller.list);
router.get("/transactions/categories/:categories", controller.list);
router.get(
  "/transactions/accounts/:accounts/categories/:categories",
  controller.list
);
router.get("/transactions/month/:month/year/:year", controller.list);
router.get(
  "/transactions/accounts/:accounts/month/:month/year/:year",
  controller.list
);
router.get(
  "/transactions/categories/:categories/month/:month/year/:year",
  controller.list
);
router.get(
  "/transactions/accounts/:accounts/categories/:categories/month/:month/year/:year",
  controller.list
);

router.post("/transactions", controller.create);
router.put("/transactions", controller.update);
router.delete("/transactions", controller.remove);

module.exports = router;
