const fs = require("fs/promises");
const Product = require("../models/product");
const Category = require("../models/category");
const slugify = require("slugify");
const cloudinary = require("../config/cloudinary");

const parseArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [value];
};

const createProduct = async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    const {
      name,
      shortDescription,
      description,
      category,
      originalPrice,
      sellingPrice,
      images: imageInput,
      colors,
      sizes,
      stock,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      status,
    } = req.body;

    if (
      !name ||
      !shortDescription ||
      !description ||
      !category ||
      originalPrice === undefined ||
      sellingPrice === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const imageEntries = parseArray(imageInput).filter(
      (image) => image && typeof image === "object",
    );

    for (const file of uploadedFiles) {
      const productImage = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      imageEntries.push({
        url: productImage.secure_url,
        public_id: productImage.public_id,
      });
    }

    const originalPriceNumber = Number(originalPrice);
    const sellingPriceNumber = Number(sellingPrice);
    const stockNumber = Number(stock);
    if (
      !Number.isFinite(originalPriceNumber) ||
      !Number.isFinite(sellingPriceNumber) ||
      !Number.isFinite(stockNumber) ||
      originalPriceNumber <= 0 ||
      sellingPriceNumber < 0 ||
      stockNumber < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Prices and stock must be valid non-negative numbers",
      });
    }

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      shortDescription,
      description,
      category,
      originalPrice: originalPriceNumber,
      sellingPrice: sellingPriceNumber,
      discountedPrice: Math.round(
        ((originalPriceNumber - sellingPriceNumber) / originalPriceNumber) * 100,
      ),
      images: imageEntries,
      colors: parseArray(colors),
      sizes: parseArray(sizes),
      stock: stockNumber,
      totalReviews: 0,
      totalSold: 0,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: isNewArrival === undefined ? true : Boolean(isNewArrival),
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await Promise.all(
      uploadedFiles.map((file) =>
        fs.unlink(file.path).catch((error) => {
          console.error(`Unable to remove uploaded file ${file.path}:`, error);
        }),
      ),
    );
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const query = /^[a-f\d]{24}$/i.test(id) ? { _id: id } : { slug: id };
    const product = await Product.findOne(query).populate("category");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      name,
      shortDescription,
      description,
      category,
      brand,
      originalPrice,
      sellingPrice,
      stock,
      colors,
      sizes,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      status,
    } = req.body;

    if (category) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      product.category = category;
    }
    if (name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, strict: true });
    }
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
    if (sellingPrice !== undefined) product.sellingPrice = Number(sellingPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (colors !== undefined) product.colors = parseArray(colors);
    if (sizes !== undefined) product.sizes = parseArray(sizes);
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (isTrending !== undefined) product.isTrending = Boolean(isTrending);
    if (isBestSeller !== undefined) product.isBestSeller = Boolean(isBestSeller);
    if (isNewArrival !== undefined) product.isNewArrival = Boolean(isNewArrival);
    if (status !== undefined) product.status = status;

    if (
      originalPrice !== undefined ||
      sellingPrice !== undefined
    ) {
      if (product.originalPrice <= 0 || product.sellingPrice < 0) {
        return res.status(400).json({ success: false, message: "Invalid product prices" });
      }
      product.discountedPrice = Math.round(
        ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100,
      );
    }

    await product.save();
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    const products = await Product.find({ category: category._id })
      .populate("category")
      .sort({ createdAt: -1 });
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found" });
    }
    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ success: false, message: "keyword is not defined" });
    }
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const items = await Product.find({
      $or: [
        { name: { $regex: escapedKeyword, $options: "i" } },
        { shortDescription: { $regex: escapedKeyword, $options: "i" } },
        { description: { $regex: escapedKeyword, $options: "i" } },
        { colors: { $regex: escapedKeyword, $options: "i" } },
      ],
    }).populate("category");
    return res.status(200).json({
      success: true,
      totalProducts: items.length,
      items,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  getProductByCategory,
  searchProduct,
};
