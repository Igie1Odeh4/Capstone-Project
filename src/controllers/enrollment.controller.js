import Enrollment from "../models/enrollment.model.js";
import mongoose from "mongoose";

/**
 * @desc    Enroll a student into a course
 * @route   POST /api/enrollments
 * @access  Private
 */
export const createEnrollment = async (req, res) => {
  try {
    const { student, course } = req.body;

    // 1. Validation: Check if required fields are provided
    if (!student || !course) {
      return res.status(400).json({
        success: false,
        message: "Please provide both student and course IDs.",
      });
    }

    // 2. Validation: Ensure the IDs are valid MongoDB ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(course)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student or course ID format.",
      });
    }

    // 3. Prevent Duplicates: Check if the student is already enrolled in this course
    const existingEnrollment = await Enrollment.findOne({ student, course });
    if (existingEnrollment) {
      return res.status(409).json({
        // 409 Conflict
        success: false,
        message: "Student is already enrolled in this course.",
      });
    }

    // 4. Creation
    const newEnrollment = await Enrollment.create({
      student,
      course,
    });

    // 5. Hydration: Populate student and course details to send a rich response to the client
    const populatedEnrollment = await Enrollment.findById(newEnrollment._id)
      .populate("student", "name email") // brings in only name and email from User model
      .populate("course", "title description"); // brings in title and description from Course model

    // 6. Success Response
    return res.status(201).json({
      success: true,
      message: "Student successfully enrolled in course.",
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    // 7. Error Handling: Catch unexpected issues safely without crashing the app
    console.error("Enrollment Error:", error);
    return res.status(500).json({
      success: false,
      message:
        "An internal server error occurred while processing the enrollment.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default Enrollment;
