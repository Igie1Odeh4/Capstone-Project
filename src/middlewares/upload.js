import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "courses/thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
    public_id: file.originalname,
  }),
});

const upload = multer({ storage });

export default upload;
