const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ============================================
// HELPER: JWT Token Generate Karo
// ============================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// ============================================
// REGISTER - Naya User Banao
// POST /api/auth/register
// ============================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // --- Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields (name, email, password)",
      });
    }

    // --- Check karo email pehle se registered toh nahi ---
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // --- Naya User Banao ---
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
    });

    // --- Success Response ---
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ============================================
// LOGIN - User Login
// POST /api/auth/login
// ============================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    // --- User Dhundho (password ke saath) ---
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --- Password Check Karo ---
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --- Success Response ---
    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrolledCourses: user.enrolledCourses,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ============================================
// GET PROFILE - Logged-in User Ki Info
// GET /api/auth/profile
// ============================================
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        enrolledCourses: user.enrolledCourses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

// ============================================
// GET ALL USERS (Admin Only)
// GET /api/auth/users
// ============================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
};
