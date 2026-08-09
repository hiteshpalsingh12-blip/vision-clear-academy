const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createCourse,
  getAllCourses,
  getAdminCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// --- Multer Setup (File Uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max (for videos)
});

// --- Public Routes ---
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// --- Protected Routes (Login Required) ---

// --- Admin Routes (Login + Admin Required) ---
router.post("/", protect, adminOnly, upload.single("image"), createCourse);
router.get("/admin/all", protect, adminOnly, getAdminCourses);
router.put("/:id", protect, adminOnly, upload.single("image"), updateCourse);
router.delete("/:id", protect, adminOnly, deleteCourse);

// --- Lesson Routes (Admin) ---
router.post(
  "/:id/lessons",
  protect,
  adminOnly,
  upload.single("video"),
  addLesson,
);
router.delete("/:id/lessons/:lessonId", protect, adminOnly, deleteLesson);

module.exports = router;
