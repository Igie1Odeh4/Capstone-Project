import Lesson from "../models/lesson.model.js";
import Course from "../models/course.model.js";
import cloudinary from "../config/cloudinary.js";

/* =========================
   CREATE LESSON
========================= */
export const createLesson = async (req, res) => {
  try {
    const { title, description, course, order, duration, isPreview } = req.body;

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let videoUrl = "";
    let videoPublicId = "";

    if (req.files?.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: "video",
        folder: "lessons/videos",
      });

      videoUrl = result.secure_url;
      videoPublicId = result.public_id;
    }

    let documentUrl = "";
    let documentPublicId = "";

    if (req.files?.document) {
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

    const lesson = await Lesson.create({
      title,
      description,
      course,
      order,
      duration,
      isPreview,
      videoUrl,
      videoPublicId,
      documentUrl,
      documentPublicId,
    });

    existingCourse.lessons.push(lesson._id);
    await existingCourse.save();

    res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
      filter.course = req.query.course;
    }

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    const lessons = await Lesson.find(filter)
      .populate("course", "title category")
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Lesson.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalLessons: total,
      lessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET SINGLE LESSON
========================= */
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("course");

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   UPDATE LESSON
========================= */
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (req.files?.video) {
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

    if (req.files?.document) {
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

    lesson.title = req.body.title || lesson.title;
    lesson.description = req.body.description || lesson.description;

    lesson.order = req.body.order ?? lesson.order;

    lesson.duration = req.body.duration ?? lesson.duration;

    lesson.isPreview = req.body.isPreview ?? lesson.isPreview;

    await lesson.save();

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE LESSON
========================= */
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

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

    await Course.findByIdAndUpdate(lesson.course, {
      $pull: {
        lessons: lesson._id,
      },
    });

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
