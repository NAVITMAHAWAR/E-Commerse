const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/adminController");

router.get("/analytics", protect, admin, getAnalytics);

module.exports = router;
