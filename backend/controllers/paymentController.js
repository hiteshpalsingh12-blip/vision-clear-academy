const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");

// ============================================
// CREATE ORDER (Demo - Razorpay Style)
// POST /api/payments/create-order
// ============================================
const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    // Course dhundho
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check karo user ne pehle se toh nahi khareeda
    const existingPayment = await Payment.findOne({
      user: req.user._id,
      course: courseId,
      status: "completed",
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course",
      });
    }

    // Demo order ID banao (Real Razorpay mein API call hoti hai)
    const orderId =
      "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // Payment record banao (pending status)
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount: course.price,
      currency: "INR",
      paymentMethod: "razorpay",
      orderId: orderId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: orderId,
        amount: course.price,
        currency: "INR",
        courseName: course.title,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error creating order" });
  }
};

// ============================================
// VERIFY PAYMENT (Demo)
// POST /api/payments/verify
// ============================================
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Order ID and Payment ID are required",
      });
    }

    // Payment record dhundho
    const payment = await Payment.findOne({ orderId: orderId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Payment status update karo
    payment.status = "completed";
    payment.paymentId = paymentId;
    payment.paymentDate = new Date();
    await payment.save();

    // Student ko course mein enroll karo
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(payment.course)) {
      user.enrolledCourses.push(payment.course);
      await user.save();
    }

    // Course ka student count badhao
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalStudents: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified! Course enrolled successfully!",
      data: {
        paymentId: payment._id,
        courseId: payment.course,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Verify Payment Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server error verifying payment" });
  }
};

// ============================================
// GET USER PAYMENTS
// GET /api/payments/my-payments
// ============================================
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("course", "title price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Get Payments Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============================================
// GET ALL PAYMENTS (Admin)
// GET /api/payments/admin
// ============================================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });

    // Total revenue calculate karo
    const totalRevenue = payments
      .filter(function (p) {
        return p.status === "completed";
      })
      .reduce(function (sum, p) {
        return sum + p.amount;
      }, 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalRevenue: totalRevenue,
      data: payments,
    });
  } catch (error) {
    console.error("Get All Payments Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
};
