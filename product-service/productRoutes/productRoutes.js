const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/create-product", createProduct);
router.patch("/update-product/:id",updateProduct);
router.delete("/delete-product/:id",deleteProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-product/:id", getProduct);

module.exports = router;
