import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { generateToken } from "../utils/generateToken.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../middlewares/validator.joi.js";

/* =========================
   REGISTER USER (WITH CLOUDINARY)
========================= */
export const registerUser = async (req, res) => {
  try {
    const { error, value } = registerUserSchema.validate(req.body);

    if (error) {
      // Clean up files immediately if validation parameters fail
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    let { name, email, password, role } = value;
    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Clean up files immediately if email conflict exists
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    let profileImage = { url: "", public_id: "" };

    // Hardened File Upload Pipeline
    if (req.file?.path) {
      try {
        if (fs.existsSync(req.file.path)) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "users/profile",
          });

          profileImage = {
            url: result.secure_url,
            public_id: result.public_id,
          };
        }
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError.message);
        // Do not crash, let the user register with the default empty profile image
      } finally {
        // Safe standalone local file elimination guard
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
      profileImage,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: userResponse._id,
        ...userResponse,
      },
    });
  } catch (err) {
    // Ultimate fallback catch-all file deletion guard
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (req, res) => {
  try {
    const { error, value } = loginUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials", // Security Best Practice: obscure exact error reasons
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   LOGOUT USER
========================= */
export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully. Please remove token from client storage.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
