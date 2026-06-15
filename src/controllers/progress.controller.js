import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import Lesson from "../models/lesson.model.js";

/* =========================
   ENROLL IN COURSE
========================= */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const studentId = req.user.id;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const existingProgress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled",
      });
    }

    const progress = await Progress.create({
      student: studentId,
      course: courseId,
    });

    res.status(201).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   MARK LESSON COMPLETE
========================= */
export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const studentId = req.user.id;

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const alreadyCompleted = progress.completedLessons.includes(lessonId);

    if (!alreadyCompleted) {
      progress.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({
      course: courseId,
    });

    const completedCount = progress.completedLessons.length;

    progress.progressPercentage = Math.round(
      (completedCount / totalLessons) * 100,
    );

    progress.completed = progress.progressPercentage === 100;

    await progress.save();

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET MY PROGRESS
========================= */
export const getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      student: req.user.id,
    })
      .populate("course")
      .populate("completedLessons");

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET COURSE PROGRESS
========================= */
export const getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.user.id,
      course: req.params.courseId,
    })
      .populate("course")
      .populate("completedLessons");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL PROGRESS
   (ADMIN)
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

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   RESET PROGRESS
========================= */
export const resetProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    progress.completedLessons = [];
    progress.progressPercentage = 0;
    progress.completed = false;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Progress reset successfully",
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE PROGRESS
========================= */
export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    await progress.deleteOne();

    res.status(200).json({
      success: true,
      message: "Progress deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
