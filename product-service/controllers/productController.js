const Product = require("../models/product");
const Category = require("../models/category");
const slugify = require("slugify");
const product = require("../models/product");
// const createProduct = async (req, res) => {
//     try {

//         const products = req.body;

//         if (!Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please provide an array of products."
//             });
//         }

//         const formattedProducts = [];

//         for (const product of products) {

//             const category = await Category.findById(product.category);

//             if (!category) {
//                 return res.status(404).json({
//                     success: false,
//                     message: `Category not found: ${product.category}`
//                 });
//             }

//             formattedProducts.push({

//                 ...product,

//                 slug: slugify(product.name, {
//                     lower: true,
//                     strict: true
//                 }),

//                 discountPercentage: Math.round(
//                     ((product.originalPrice - product.sellingPrice) /
//                         product.originalPrice) * 100
//                 ),

//                 totalReviews: 0,

//                 totalSold: 0

//             });
//         }

//         const savedProducts = await Product.insertMany(formattedProducts);

//         return res.status(201).json({
//             success: true,
//             message: "Products created successfully.",
//             totalProducts: savedProducts.length,
//             products: savedProducts
//         });

//     } catch (error) {

//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });

//     }
// };
const createProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      description,
      category,
      originalPrice,
      sellingPrice,
      images,
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
      !originalPrice ||
      !sellingPrice ||
      !stock
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
        message: "Product already exixts",
      });
    }
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });
    const discountedPrice = Math.round(
      ((originalPrice - sellingPrice) / originalPrice) * 100,
    );

    const product = await Product.create({
      name,
      slug,
      shortDescription,
      description,
      category,
      originalPrice,
      sellingPrice,
      discountedPrice,
      images,
      colors,
      sizes,
      stock,
      totalReviews: 0,
      totalSold: 0,
      isFeatured,
      isTrending,
      isBestSeller,
      isNewArrival,
      status,
    });
    res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .sort({ createdAt: -1 });
    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        messsage: "No product is there",
      });
    }
    return res.status(201).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      shortDescription,
      description,
      category,
      brand,
      originalPrice,
      discountedPrice,
      stock,
    } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (category) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      product.category = category;
    }
    if (name) {
      product.name = name;
      product.slug = slugify(name, {
        lower: true,
        strict: true,
      });
    }
    if (shortDescription) {
      product.shortDescription = shortDescription;
    }
    if (description) {
      product.description = description;
    }
    if (brand) {
      product.brand = brand;
    }
    if (originalPrice !== undefined) {
      product.originalPrice = originalPrice;
    }
    if (discountedPrice !== undefined) {
      product.discountedPrice = discountedPrice;
    }
    if (originalPrice !== undefined || discountedPrice !== undefined) {
      product.discountedPrice = Math.round(
        ((product.originalPrice - product.discountPrice) /
          product.originalPrice) *
          100,
      );
    }
    if (stock !== undefined) {
      product.stock = stock;
    }
    await product.save();
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await Product.findByIdAndDelete(id);
    return res.status(201).json({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = Product.find({ slug }).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
const getproductByCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    const product = await Products.find({ category: category.id }).populate(
      "category",
    );
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found",
      });
    }
    return res.status(200).json({
      success: true,
      totalProducts: product.length,
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const searchProduct = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "keyword is not defined",
      });
    }
    const items = Product.find({
      $or: [
        {
          name: {
            $regax: keyword,
            $options: "i",
          },
        },
        {
          shortDescription: {
            $regax: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regax: keyword,
            $options: "i",
          },
        },
        {
          colors: {
            $regax: keyword,
            $options: "i",
          },
        },
      ],
    }).populate("category");
    return res.status(200).json({
      success: true,
      totalProducts: items.length,
      items,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  getproductByCategory,
  searchProduct,
};
