import ActivityLog from "../models/ActivityLog.js";

const logActivity = async ({
  user,
  action,
  course = null,
  lesson = null,
  metadata = {},
}) => {
  try {
    await ActivityLog.create({
      user,
      action,
      course,
      lesson,
      metadata,
    });
  } catch (error) {
    console.log("Activity log error:", error.message);
  }
};

export default logActivity;
