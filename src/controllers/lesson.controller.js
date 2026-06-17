import Lesson from "../models/lesson.model.js";
import Course from "../models/course.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/* =========================
   CREATE LESSON
========================= */
export const createLesson = async (req, res) => {
  try {
    const { title, description, course, order, duration, isPreview } = req.body;

    // 1. Validation Guards
    if (!title || !course || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, course, and order are required fields.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID format.",
      });
    }

    const existingCourse = await Course.findById(course);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 2. Asset Pipeline Processing
    let videoUrl = "";
    let videoPublicId = "";
    if (req.files?.video?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: "video",
        folder: "lessons/videos",
      });
      videoUrl = result.secure_url;
      videoPublicId = result.public_id;
    }

    let documentUrl = "";
    let documentPublicId = "";
    if (req.files?.document?.[0]) {
      const result = await cloudinary.uploader.upload(
        req.files.document[0].path,
        {
          resource_type: "raw",
          folder: "lessons/documents",
        },
      );
      documentUrl = result.secure_url;
      documentPublicId = result.public_id;
    }

    // 3. Database Execution
    const lesson = await Lesson.create({
      title,
      description: description || "",
      course,
      order: Number(order),
      duration: Number(duration) || 0,
      isPreview: isPreview === "true" || isPreview === true,
      videoUrl,
      videoPublicId,
      documentUrl,
      documentPublicId,
    });

    // 4. Update Parent Document References
    existingCourse.lessons.push(lesson._id);
    await existingCourse.save();

    return res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL LESSONS
========================= */
export const getLessons = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.course) {
      if (!mongoose.Types.ObjectId.isValid(req.query.course)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid filter course ID format.",
          });
      }
      filter.course = req.query.course;
    }

    // ✅ OPTIMIZED: Leverages your model's native text index instead of expensive regex scans
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const lessons = await Lesson.find(filter)
      .populate("course", "title category")
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Lesson.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalLessons: total,
      lessons,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET SINGLE LESSON
========================= */
export const getLessonById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID format." });
    }

    const lesson = await Lesson.findById(req.params.id).populate("course");
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   UPDATE LESSON
========================= */
export const updateLesson = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID format." });
    }

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    // Asset Replacements Workflow
    if (req.files?.video?.[0]) {
      if (lesson.videoPublicId) {
        await cloudinary.uploader.destroy(lesson.videoPublicId, {
          resource_type: "video",
        });
      }
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: "video",
        folder: "lessons/videos",
      });
      lesson.videoUrl = result.secure_url;
      lesson.videoPublicId = result.public_id;
    }

    if (req.files?.document?.[0]) {
      if (lesson.documentPublicId) {
        await cloudinary.uploader.destroy(lesson.documentPublicId, {
          resource_type: "raw",
        });
      }
      const result = await cloudinary.uploader.upload(
        req.files.document[0].path,
        {
          resource_type: "raw",
          folder: "lessons/documents",
        },
      );
      lesson.documentUrl = result.secure_url;
      lesson.documentPublicId = result.public_id;
    }

    // Dynamic fields assignment
    lesson.title = req.body.title || lesson.title;
    lesson.description = req.body.description || lesson.description;
    lesson.order =
      req.body.order !== undefined ? Number(req.body.order) : lesson.order;
    lesson.duration =
      req.body.duration !== undefined
        ? Number(req.body.duration)
        : lesson.duration;
    lesson.isPreview =
      req.body.isPreview !== undefined
        ? req.body.isPreview === "true" || req.body.isPreview === true
        : lesson.isPreview;

    await lesson.save();

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    console.error("UPDATE LESSON ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   DELETE LESSON
========================= */
export const deleteLesson = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid lesson ID format." });
    }

    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found" });
    }

    // Cloudinary Storage Cleanup
    if (lesson.videoPublicId) {
      await cloudinary.uploader.destroy(lesson.videoPublicId, {
        resource_type: "video",
      });
    }
    if (lesson.documentPublicId) {
      await cloudinary.uploader.destroy(lesson.documentPublicId, {
        resource_type: "raw",
      });
    }

    // Sync structural adjustments with Parent Document Array references
    await Course.findByIdAndUpdate(lesson.course, {
      $pull: { lessons: lesson._id },
    });

    await lesson.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
