import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    videoUrl: {
      type: String,
      default: "",
    },

    videoPublicId: {
      type: String,
      default: "",
    },

    documentUrl: {
      type: String,
      default: "",
    },

    documentPublicId: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    duration: {
      type: Number,
      default: 0,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

lessonSchema.index({ title: "text" });

export default mongoose.model("Lesson", lessonSchema);
