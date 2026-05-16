const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const notesController = require("../controllers/notes.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", notesController.getAll);
router.get("/search", notesController.search);
router.get("/:id", notesController.getOne);
router.post("/", notesController.create);
router.put("/:id", notesController.update);
router.delete("/:id", notesController.remove);
router.post("/:id/share", notesController.share);

module.exports = router;
