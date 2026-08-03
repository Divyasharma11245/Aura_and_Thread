const Category = require("../models/category");
const slugify = require("slugify");
const createCategory = async (req, res) => {
  try {
    //   const { name, brand, gender } = req.body;
    //   if (!name || !brand || !gender) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Please fill all required fields",
    //     });
    //   }
    //   const slug = slugify(name, {
    //     lower: true,
    //     strict: true,
    //   });
    //   const existingcategory = await Category.findOne({ slug });
    //   if (existingcategory) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Category already exists",
    //     });
    //   }
    //   const category = await Category.insertMany({
    //     name,
    //     slug,
    //     brand,
    //     gender,
    //   });
    const categories = req.body;

    const formattedCategories = categories.map((category) => ({
      ...category,
      slug: slugify(category.name, {
        lower: true,
        strict: true,
      }),
    }));

    const savedCategories = await Category.insertMany(formattedCategories);
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      savedCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if (categories.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found",
      });
    }
    return res.status(200).json({
      success: true,
      totalCategories: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const getCategory = async (req, res) => {
  try {
    const { name, gender, brand } = req.body;
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (gender) {
      query.gender = gender;
    }
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }
    const category = await Category.find(query);
    if (category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Categories found successfully",
      totalCategories: category.length,
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, gender } = req.body;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    if (name) {
      category.name = name;
      category.slug = slugify(name, {
        lower: true,
        strict: true,
      });
    }
    if (brand) {
      category.brand = brand;
    }
    if (gender) {
      category.gender = gender;
    }
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    await Category.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const searchCategory = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "keyword is not defined",
      });
    }
    const categories = await Category.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    });
    return res.status(200).json({
      success: true,
      totalCategories: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
module.exports = {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
