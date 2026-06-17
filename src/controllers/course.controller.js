import Course from "../models/course.model.js";
import cloudinary from "../config/cloudinary.js";
import logActivity from "../utils/logActivity.js";

/* =========================
   CREATE COURSE
========================= */
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, published } =
      req.body;

    // 1. Authentication Check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    // 2. Input Validation Guard
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category fields are required.",
      });
    }

    // 3. Corrected Cloudinary Upload Workflow
    let thumbnail = { url: "", public_id: "" };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses/thumbnails",
        resource_type: "image",
      });
      thumbnail = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // 4. Create Document
    const course = await Course.create({
      title,
      description,
      category,
      price: Number(price) || 0,
      duration: Number(duration) || 0,
      published: published === "true" || published === true,
      instructor: req.user._id || req.user.id, // Handles both styles safely
      thumbnail,
    });

    // 5. Log Action
    await logActivity({
      user: req.user._id || req.user.id,
      action: "COURSE_CREATED",
      course: course._id,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET ALL COURSES
========================= */
export const getCourses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    if (req.query.published !== undefined) {
      filter.published = req.query.published === "true";
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email role")
      .populate("lessons")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
      courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   GET COURSE BY ID
========================= */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email role")
      .populate("lessons");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   UPDATE COURSE
========================= */
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Ownership Enforcement Safeguard
    const currentUserId = req.user._id || req.user.id;
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== currentUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this course.",
      });
    }

    if (req.file) {
      if (course.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(course.thumbnail.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses/thumbnails",
      });

      course.thumbnail = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.category = req.body.category || course.category;
    course.price = req.body.price ?? course.price;
    course.duration =
      req.body.duration !== undefined
        ? Number(req.body.duration)
        : course.duration;
    course.published =
      req.body.published !== undefined
        ? req.body.published === "true" || req.body.published === true
        : course.published;

    await course.save();

    await logActivity({
      user: currentUserId,
      action: "COURSE_UPDATED",
      course: course._id,
    });

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   DELETE COURSE
========================= */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const currentUserId = req.user._id || req.user.id;
    if (
      req.user.role !== "admin" &&
      course.instructor.toString() !== currentUserId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Action denied.",
      });
    }

    if (course.thumbnail?.public_id) {
      await cloudinary.uploader.destroy(course.thumbnail.public_id);
    }

    await Course.findByIdAndDelete(course._id);

    await logActivity({
      user: currentUserId,
      action: "COURSE_DELETED",
      course: course._id,
    });

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
