import express from "express";
import multer from "multer";

import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../utils/requireAuth.js";

const router = express.Router();

import upload from "../middlewares/upload.js";

/* =========================
   PUBLIC ROUTES
========================= */

// Register with profile image upload (Cloudinary-ready)
router.post("/register", upload.single("profileImage"), registerUser);

router.post("/login", loginUser);

/* =========================
   PROTECTED ROUTES
========================= */

// Get logged-in user profile
router.get("/profile", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Admin only route
router.get("/admin", requireAuth, requireRole(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Admin access granted",
  });
});

export default router;
