// ============================================
// FOREX TRADING ACADEMY - Main Server File
// ============================================

// --- Packages Import ---
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// --- Environment Variables Load ---
dotenv.config();

// --- Database Connection Import ---
const connectDB = require("./config/db");

// --- Express App Initialize ---
const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
); // Frontend ko backend se connect hone do
app.use(express.json()); // JSON data accept karo
app.use(express.urlencoded({ extended: true })); // Form data accept karo

// --- Static Files (Frontend) ---
app.use(express.static(path.join(__dirname, "../frontend")));

// --- Uploaded Files Serve ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
// --- API Routes ---
app.get("/api", (req, res) => {
  res.json({
    message: "🎓 Forex Trading Academy API is running!",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
// --- Home Page Route ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// --- Database Connect Karo Aur Server Start Karo ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║  🎓 Forex Trading Academy Server         ║
    ║  ✅ Running on port: ${PORT}                  ║
    ║  🌐 http://localhost:${PORT}                ║
    ╚══════════════════════════════════════════╝
    `);
  });
});
