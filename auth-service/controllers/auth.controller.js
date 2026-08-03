import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verificationOTPTemplate } from "../templates/verificationOTPTemplate.js";
import { sendEmail } from "../services/email.services.js";
import { resetPasswordOTPTemplate } from "../templates/resetPasswordOTPTemplate.js";

export const signup = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists!",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationOTP,
      verificationOTPExpiry: Date.now() + 10 * 60 * 1000,
    });

    const template = verificationOTPTemplate(name, verificationOTP);
    try {
      await sendEmail({
        to: email,
        subject: "Verify Email",
        template,
      });
    } catch (err) {
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Unable to send verification email.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server Error!",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email or OTP are required",
      });
    }
    const user = await User.findOne({ email, verificationOTP: otp });
    if (!user) {
      return res.status(400).json({

        success: false,
        message: "Invalid email or OTP.",
      });
    }

    if (user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "User already verified",
      });
    }

    if (
      !user.verificationOTPExpiry ||
      user.verificationOTPExpiry <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired!",
      });
    }
    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpiry = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfull",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Internal server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }
    const resetPasswordOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.resetPasswordOTP = resetPasswordOTP;
    user.resetPasswordOTPExpiry = Date.now() + 10 * 60 * 1000;
    const template = resetPasswordOTPTemplate(user.name, resetPasswordOTP);
    await sendEmail({
      to: email,
      subject: "Reset Password",
      template,
    });
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Reset Password Email sent successfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!otp || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Otp and password are required!",
      });
    }
    const user = await User.findOne({ email, resetPasswordOTP: otp });
    if (!user) {
      return res.status(409).json({
        success: true,
        message: "If an account exists, a password reset OTP has been sent.",
      });
    }
    if (
      !user.resetPasswordOTPExpiry ||
      user.resetPasswordOTPExpiry <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired!",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const changePassword = async (req, res) => {
//   try {
//     const user =
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
