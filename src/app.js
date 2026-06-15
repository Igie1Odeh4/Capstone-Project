import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.Routes.js";
import courseRoutes from "./routes/course.routes.js";
import lessonRoutes from "./routes/lesson.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

import { requestLogger } from "./middlewares/requestLogger.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
