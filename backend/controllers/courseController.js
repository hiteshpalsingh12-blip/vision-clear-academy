const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, instructor } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description and price",
      });
    }

    const course = await Course.create({
      title,
      description,
      price,
      category: category || "beginner",
      instructor: instructor || "Forex Academy",
      image: req.file ? "/uploads/" + req.file.filename : "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully!",
      data: course,
    });
  } catch (error) {
    console.error("Create Course Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error creating course" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Get Courses Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching courses" });
  }
};

const getAdminCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Get Admin Courses Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Get Course Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const {
      title,
      description,
      price,
      category,
      instructor,
      isPublished,
      isLocked,
    } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price !== undefined ? price : course.price;
    course.category = category || course.category;
    course.instructor = instructor || course.instructor;
    course.isPublished =
      isPublished !== undefined ? isPublished : course.isPublished;
    course.isLocked = isLocked !== undefined ? isLocked : course.isLocked;

    if (req.file) {
      course.image = "/uploads/" + req.file.filename;
    }

    await course.save();
    res
      .status(200)
      .json({ success: true, message: "Course updated!", data: course });
  } catch (error) {
    console.error("Update Course Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    await course.deleteOne();
    res.status(200).json({ success: true, message: "Course deleted!" });
  } catch (error) {
    console.error("Delete Course Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const addLesson = async (req, res) => {
  try {
    const { title, duration, order, isFree } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide lesson title" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const videoUrl = req.file
      ? "/uploads/" + req.file.filename
      : req.body.videoUrl || "";

    if (!videoUrl) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please upload a video or provide URL",
        });
    }

    const lesson = {
      title,
      videoUrl,
      duration: duration || "00:00",
      order: order || course.lessons.length + 1,
      isFree: isFree || false,
    };

    course.lessons.push(lesson);
    await course.save();

    res
      .status(201)
      .json({ success: true, message: "Lesson added!", data: course });
  } catch (error) {
    console.error("Add Lesson Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    course.lessons = course.lessons.filter(function (lesson) {
      return lesson._id.toString() !== req.params.lessonId;
    });

    await course.save();
    res
      .status(200)
      .json({ success: true, message: "Lesson deleted!", data: course });
  } catch (error) {
    console.error("Delete Lesson Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getAdminCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
};
