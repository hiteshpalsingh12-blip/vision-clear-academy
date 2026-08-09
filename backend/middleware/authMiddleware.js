const jwt = require("jsonwebtoken");
const User = require("../models/User");

// --- Protect Routes: Sirf Logged-in Users Access Kar Sakte Hain ---
const protect = async (req, res, next) => {
  let token;

  // Check karo ki Authorization header mein Bearer token hai ya nahi
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token nikalo (Bearer ke baad wala part)
      token = req.headers.authorization.split(" ")[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko find karo aur req mein add karo (password ke bina)
      req.user = await User.findById(decoded.id).select("-password");

      // Agle function pe bhejo
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  // Agar token nahi mila
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };
