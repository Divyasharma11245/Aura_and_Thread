const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  getProductByCategory,
  searchProduct,
} = require("../controllers/productController");
router.get("/search",searchProduct);
router.post("/create-product", createProduct);
router.patch("/update-product/:id",updateProduct);
router.delete("/delete-product/:id",deleteProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-product/:id", getProduct);
router.get("/get-product/:slug",getProductBySlug);
// router.get("/category/:slug",getProductByCategory);
module.exports = router;
