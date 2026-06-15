📚 Capstone Project – Learning Management System (LMS) API

A full-featured Node.js + Express + MongoDB backend API for an LMS platform with authentication, courses, lessons, progress tracking, file uploads, analytics, and role-based access control.

🚀 Features
🔐 Authentication
User registration & login (JWT)
Password hashing with bcrypt
Role-based access control (Admin, Instructor, Student)
📚 Courses & Lessons
Create, update, delete courses
Add lessons to courses
Upload videos & documents via Cloudinary
Populate relationships (Course → Lessons)
📊 Progress Tracking
Track user course progress
Mark lessons as completed
📈 Analytics
Platform-wide statistics (admin dashboard)
Instructor analytics
Course performance insights
User activity tracking
☁️ File Uploads
Cloudinary integration for:
Videos
Documents
Thumbnails
🔎 Advanced Query Features
Pagination
Filtering
Search
Sorting
🛠 Tech Stack
Node.js
Express.js
MongoDB + Mongoose
JWT (Authentication)
bcryptjs
Cloudinary
Multer
Joi Validation
Morgan (logging)
Helmet (security)
CORS
📁 Project Structure
Capstone-Project/
│
├── src/
│ ├── config/
│ │ ├── db.js
│ │ └── cloudinary.js
│ │
│ ├── controllers/
│ │ ├── auth.controller.js
│ │ ├── courseController.js
│ │ ├── lesson.controller.js
│ │ ├── progressController.js
│ │ └── analyticsController.js
│ │
│ ├── models/
│ │ ├── User.js
│ │ ├── Course.js
│ │ ├── Lesson.js
│ │ ├── Progress.js
│ │ └── ActivityLog.js
│ │
│ ├── routes/
│ │ ├── auth.Routes.js
│ │ ├── course.routes.js
│ │ ├── lesson.routes.js
│ │ ├── progress.routes.js
│ │ └── analytics.routes.js
│ │
│ ├── middlewares/
│ │ ├── requireAuth.js
│ │ ├── validator.joi.js
│ │ └── requestLogger.js
│ │
│ ├── utils/
│ │ ├── generateToken.js
│ │ └── logActivity.js
│ │
│ ├── app.js
│ └── index.js
│
├── .env
├── package.json
└── README.md
⚙️ Environment Variables

Create a .env file:

PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
📦 Installation
git clone https://github.com/your-username/capstone-project.git
cd capstone-project
npm install
▶️ Running the Project
Development mode
npm run dev
Production
npm start
🌐 Base URL
http://localhost:5050/api
🔐 API Endpoints
Auth
POST /api/auth/register
POST /api/auth/login
Courses
GET /api/courses
POST /api/courses
GET /api/courses/:id
PUT /api/courses/:id
DELETE /api/courses/:id
Lessons
GET /api/lessons
POST /api/lessons
GET /api/lessons/:id
Progress
GET /api/progress
POST /api/progress
Analytics (Admin / Instructor)
GET /api/analytics/platform
GET /api/analytics/course/:courseId
GET /api/analytics/instructor
GET /api/analytics/user
🔐 Roles
Role Access
Admin Full platform control
Instructor Manage courses & analytics
Student Enroll & track progress
☁️ Cloudinary Setup

Used for uploading:

Course thumbnails
Lesson videos
Documents
🧠 Key Features Implemented
JWT Authentication
Middleware protection (requireAuth, requireRole)
File upload with Multer
Cloudinary integration
Aggregation-based analytics
Pagination & filtering
MongoDB population (populate)
🧪 Testing

Use Postman:

Set header:
Content-Type: application/json
Authorization: Bearer <token>
