const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
// WAITING FOR JWT AUTH FOR HANDLING AUTHORISATION FOR ADDING A NEW CATEGORY BY ADMIN ONLY

router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.get("/", categoryController.getAllCategories);
module.exports = router;
