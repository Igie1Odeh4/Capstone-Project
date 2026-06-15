import express from "express";
import {
  enrollCourse,
  completeLesson,
  getMyProgress,
  getCourseProgress,
  getAllProgress,
  resetProgress,
  deleteProgress,
} from "../controllers/progress.controller.js";

import { requireAuth, requireRole } from "../utils/requireAuth.js";

const router = express.Router();

router.post("/enroll", requireAuth, enrollCourse);

router.post("/complete", requireAuth, completeLesson);

router.get("/my-progress", requireAuth, getMyProgress);

router.get("/course/:courseId", requireAuth, getCourseProgress);

router.get("/", requireAuth, requireRole(["admin"]), getAllProgress);

router.put("/reset/:id", requireAuth, requireRole(["admin"]), resetProgress);

router.delete("/:id", requireAuth, requireRole(["admin"]), deleteProgress);

export default router;
