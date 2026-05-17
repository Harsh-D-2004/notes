const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const groupsController = require("../controllers/groups.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", groupsController.getAll);
router.post("/", groupsController.create);
router.put("/:id", groupsController.update);

module.exports = router;
