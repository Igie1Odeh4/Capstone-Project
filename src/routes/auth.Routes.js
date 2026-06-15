import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../utils/requireAuth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route - any logged-in user
router.get("/profile", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Admin-only route
router.get("/admin", requireAuth, requireRole(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Admin access granted",
  });
});

export default router;
