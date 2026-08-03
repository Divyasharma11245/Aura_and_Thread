import express from "express";

import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteUser,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

// Protected Routes
router.put("/change-password", authMiddleware, changePassword);
router.delete("/deleteUser", authMiddleware, deleteUser);
// router.post("/logout", authMiddleware, logout);

export default router;
