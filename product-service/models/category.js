const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required:true,
  },
  slug: {
    type: String,
  },
  brand: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Men", "Women", "Unisex"],
    required: true,
  },
});


module.exports = mongoose.model("Category",categorySchema);