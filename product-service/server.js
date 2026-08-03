const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const productRoutes = require("./productRoutes/productRoutes");
const categoryRoutes = require("./productRoutes/categoryRoutes");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb!");
  } catch (e) {
    console.log(e);
  }
};
connectDb();
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.get("/", (req, res) => {
  res.send("Product Service Running...");
});
app.listen(process.env.PORT, () => {
  console.log("App is listening on Port 3001");
});
