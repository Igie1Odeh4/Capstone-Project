import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";
import Lesson from "../models/lesson.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

/* =========================
   PLATFORM OVERVIEW
========================= */
export const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ published: true });

    // Fixed: Pulling enrollment states from Progress since that acts as your mapping collection
    const totalEnrollments = await Progress.countDocuments();
    const totalLessons = await Lesson.countDocuments();

    // Counts across total array lengths of completed lesson elements internally
    const progressRecords = await Progress.find({}, "completedLessons");
    const completedLessonsCount = progressRecords.reduce(
      (acc, curr) => acc + (curr.completedLessons?.length || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalLessons,
        completedLessonsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   COURSE ANALYTICS
========================= */
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

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

    // Fixed mapping strategy
    const enrollments = await Progress.countDocuments({ course: courseId });
    const completedStudents = await Progress.countDocuments({
      course: courseId,
      completed: true,
    });
    const totalLessons = await Lesson.countDocuments({ course: courseId });

    return res.status(200).json({
      success: true,
      analytics: {
        courseId,
        title: course.title,
        enrollments,
        completedStudents,
        totalLessons,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   INSTRUCTOR DASHBOARD
========================= */
export const getInstructorAnalytics = async (req, res) => {
  try {
    // Fixed: Handles identity fallback consistency securely
    const instructorId = req.user._id || req.user.id;

    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const totalPublished = await Course.countDocuments({
      instructor: instructorId,
      published: true,
    });

    // Fixed collection references to look inside Progress matching your database strategy
    const totalEnrollments = await Progress.countDocuments({
      course: { $in: courseIds },
    });
    const totalStudentsArray = await Progress.distinct("student", {
      course: { $in: courseIds },
    });
    const graduatedStudents = await Progress.countDocuments({
      course: { $in: courseIds },
      completed: true,
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalCourses,
        totalPublished,
        totalEnrollments,
        totalStudents: totalStudentsArray.length,
        completedCoursesCount: graduatedStudents,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   USER PROGRESS ANALYTICS
========================= */
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const totalEnrollments = await Progress.countDocuments({ student: userId });
    const completedCourses = await Progress.countDocuments({
      student: userId,
      completed: true,
    });
    const inProgressCourses = await Progress.countDocuments({
      student: userId,
      completed: false,
    });

    return res.status(200).json({
      success: true,
      analytics: {
        totalEnrollments,
        completedCourses,
        inProgressCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
