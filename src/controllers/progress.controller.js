import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";
import mongoose from "mongoose";

/* =========================
   ENROLL IN COURSE
========================= */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course ID format." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Leverages unique compound index strategy to catch multi-click race conditions
    const existingProgress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });
    if (existingProgress) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course." });
    }

    const progress = await Progress.create({
      student: studentId,
      course: courseId,
      completedLessons: [],
      progressPercentage: 0,
    });

    return res.status(201).json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   MARK LESSON COMPLETE
========================= */
export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.user._id || req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID or lesson ID format.",
      });
    }

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Enrollment record not found for this course.",
      });
    }

    const alreadyCompleted = progress.completedLessons.includes(lessonId);
    if (!alreadyCompleted) {
      progress.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = progress.completedLessons.length;

    // Guard against edge cases where a course has 0 lessons to prevent NaN mathematically
    progress.progressPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    progress.completed = progress.progressPercentage === 100;

    await progress.save();

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET MY PROGRESS
========================= */
export const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const progress = await Progress.find({ student: studentId })
      .populate("course")
      .populate("completedLessons");

    return res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET COURSE PROGRESS
========================= */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID parameter format.",
      });
    }

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
    })
      .populate("course")
      .populate("completedLessons");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No enrollment progress found for this course.",
      });
    }

    return res.status(200).json({ success: true, progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL PROGRESS (ADMIN)
========================= */
export const getAllProgress = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const progress = await Progress.find()
      .populate("student", "name email")
      .populate("course", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Progress.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      progress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   RESET PROGRESS
========================= */
export const resetProgress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress record ID format.",
      });
    }

    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress record not found." });
    }

    progress.completedLessons = [];
    progress.progressPercentage = 0;
    progress.completed = false;

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Progress track reset successfully.",
      progress,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   DELETE PROGRESS
========================= */
export const deleteProgress = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format." });
    }

    const progress = await Progress.findById(req.params.id);
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress reference tracking entity missing.",
      });
    }

    await progress.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Progress history entity deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
