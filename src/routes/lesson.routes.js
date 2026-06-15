import express from "express";
import {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller.js";

import { requireAuth, requireRole } from "../utils/requireAuth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  createLesson,
);

router.get("/", getLessons);

router.get("/:id", getLessonById);

router.put(
  "/:id",
  requireAuth,
  requireRole(["admin", "instructor"]),
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  updateLesson,
);

router.delete("/:id", requireAuth, requireRole(["admin"]), deleteLesson);

export default router;
