import express from "express";
import {
  getPlatformStats,
  getCourseAnalytics,
  getInstructorAnalytics,
  getUserAnalytics,
} from "../controllers/analyticsController.js";

import { requireAuth, requireRole } from "../utils/requireAuth.js";

const router = express.Router();

/* Admin dashboard */
router.get("/platform", requireAuth, requireRole(["admin"]), getPlatformStats);

/* Course analytics */
router.get(
  "/course/:courseId",
  requireAuth,
  requireRole(["admin", "instructor"]),
  getCourseAnalytics,
);

/* Instructor dashboard */
router.get(
  "/instructor",
  requireAuth,
  requireRole(["instructor", "admin"]),
  getInstructorAnalytics,
);

/* User dashboard */
router.get("/user", requireAuth, requireRole(["student"]), getUserAnalytics);

export default router;
