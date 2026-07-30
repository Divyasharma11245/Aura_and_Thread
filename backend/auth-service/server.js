import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello world from auth service");
});

connectDb();

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}`);
});
