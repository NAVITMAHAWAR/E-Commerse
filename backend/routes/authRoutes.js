const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const {
  register,
  loginUser,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { success: false, message: "Too many requests. Try again later." },
});

router.post("/register", register);
router.post("/login", loginUser);
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});
router.post("/google", googleLogin);

router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);
module.exports = router;
