const express = require("express");
const router = express.Router();
const { createCategory,getAllCategories,getCategory,updateCategory,deleteCategory } = require("../controllers/categoryController");


router.post("/create-category",createCategory);
router.get("/get-all-categories",getAllCategories);
router.post("/get-category",getCategory);
router.patch("/update-category/:id",updateCategory);
router.delete("/delete-category/:id",deleteCategory);
module.exports = router;