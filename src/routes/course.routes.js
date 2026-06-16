import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

import { requireAuth, requireRole } from "../utils/requireAuth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/* Create Course */
router.post(
  "/",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.single("thumbnail"),
  createCourse,
);

/* Get All Courses */
router.get("/", getCourses);

/* Get Single Course */
router.get("/:id", getCourseById);

/* Update Course */
router.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.single("thumbnail"),
  updateCourse,
);

/* Delete Course */
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteCourse);

export default router;
