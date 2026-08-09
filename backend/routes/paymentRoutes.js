const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getAllPayments,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

// Student routes (login required)
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/my-payments", protect, getMyPayments);

// Admin routes
router.get("/admin", protect, adminOnly, getAllPayments);

module.exports = router;
