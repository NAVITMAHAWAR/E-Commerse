const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrder,
  getOrderById,
  createRazorpayOrder,
  verifyPayment,
  generateInvoice,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrder);
router.get("/:id", protect, getOrderById);
router.get("/:id/invoice", protect, generateInvoice);
router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPayment);

// router.get("/orders/my", getMyOrders )
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
