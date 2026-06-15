import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";
import Lesson from "../models/lesson.model.js";
import User from "../models/user.model.js";
import Enrollment from "../models/enrollment.model.js";

/* =========================
PLATFORM OVERVIEW
========================= */
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({
      published: true,
    });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalLessons = await Lesson.countDocuments();

    const completedLessons = await Progress.countDocuments({
      completed: true,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalLessons,
        completedLessons,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
COURSE ANALYTICS
========================= */
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const enrollments = await Enrollment.countDocuments({
      course: courseId,
    });

    const completedUsers = await Progress.distinct("student", {
      course: courseId,
      completed: true,
    });

    const totalLessons = await Lesson.countDocuments({
      course: courseId,
    });

    res.status(200).json({
      success: true,
      analytics: {
        courseId,
        title: course.title,
        enrollments,
        completedStudents: completedUsers.length,
        totalLessons,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
INSTRUCTOR DASHBOARD
========================= */
export const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({
      instructor: instructorId,
    });

    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;

    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    const totalStudents = await Enrollment.distinct("student", {
      course: { $in: courseIds },
    });

    const totalPublished = await Course.countDocuments({
      instructor: instructorId,
      published: true,
    });

    const totalCompleted = await Progress.countDocuments({
      course: { $in: courseIds },
      completed: true,
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalCourses,
        totalPublished,
        totalEnrollments,
        totalStudents: totalStudents.length,
        totalCompletedLessons: totalCompleted,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
USER PROGRESS ANALYTICS
========================= */
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalEnrollments = await Enrollment.countDocuments({
      student: userId,
    });

    const completedLessons = await Progress.countDocuments({
      student: userId,
      completed: true,
    });

    const inProgressCourses = await Progress.distinct("course", {
      student: userId,
      completed: false,
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalEnrollments,
        completedLessons,
        inProgressCourses: inProgressCourses.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
