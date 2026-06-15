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

router.post(
  "/",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.single("thumbnail"),
  createCourse,
);

router.get("/", getCourses);

router.get("/:id", getCourseById);

router.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.single("thumbnail"),
  updateCourse,
);

router.delete("/:id", requireAuth, requireRole(["admin"]), deleteCourse);

export default router;
