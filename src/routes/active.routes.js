const router = require("express-promise-router")();
const controller = require("../controllers/active.controller");

const authMiddleware = require("../middlewares/auth");
router.use(authMiddleware);

router.get("/actives", controller.list);
router.post("/actives", controller.create);
router.put("/actives", controller.update);
router.delete("/actives/:id", controller.delete);
router.post("/actives/upload", controller.upload);
router.get("/actives/category/:id", controller.list_by_category);

module.exports = router;
