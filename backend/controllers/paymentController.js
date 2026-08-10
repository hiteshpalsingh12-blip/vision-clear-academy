const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const existing = await Payment.findOne({
      user: req.user._id,
      course: courseId,
      status: "completed",
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already purchased" });
    }

    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      user: req.user._id,
      course: courseId,
      amount: course.price,
      currency: "INR",
      paymentMethod: "razorpay",
      orderId: order.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseName: course.title,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create Order Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY PAYMENT
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment details missing" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    payment.status = "completed";
    payment.paymentId = razorpay_payment_id;
    payment.paymentDate = new Date();
    await payment.save();

    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(payment.course)) {
      user.enrolledCourses.push(payment.course);
      await user.save();
    }

    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalStudents: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified! Course enrolled!",
      data: { courseId: payment.course },
    });
  } catch (error) {
    console.error("Verify Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET MY PAYMENTS
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("course", "title price image")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET ALL PAYMENTS (Admin)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 });
    const totalRevenue = payments
      .filter(function (p) {
        return p.status === "completed";
      })
      .reduce(function (sum, p) {
        return sum + p.amount;
      }, 0);
    res
      .status(200)
      .json({
        success: true,
        count: payments.length,
        totalRevenue: totalRevenue,
        data: payments,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createOrder, verifyPayment, getMyPayments, getAllPayments };
