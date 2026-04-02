const express = require("express");
const router = express.Router();
const {
  getProducts,
  createProduct,
  getProductById,
  deleteProduct,
  addProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

//admin routes

router.post("/", protect, createProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/add", protect, admin, upload.single("image"), addProduct);

module.exports = router;
