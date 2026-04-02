const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const getProducts = async (req, res) => {
  try {
    const {
      category,
      q,
      minPrice,
      maxPrice,
      sort = "ratingHigh",
      inStock,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === "true") filter.countInStock = { $gt: 0 };

    // Build sort object
    const sortMap = {
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      newest: { createdAt: -1 },
      ratingHigh: { rating: -1, numReviews: -1 },
    };
    const sortObj = sortMap[sort] || sortMap["ratingHigh"];

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, countInStock } =
      req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      countInStock: countInStock || 0,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne(); // ya product.remove() in older mongoose
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, price, countInStock, description, category } = req.body;

    // Validation
    if (
      !name ||
      !price ||
      !countInStock ||
      !description ||
      !category ||
      !req.file
    ) {
      return res
        .status(400)
        .json({ message: "All fields and image are required" });
    }

    const image = `/uploads/${req.file.filename}`;

    const product = new Product({
      name,
      price: Number(price),
      countInStock: Number(countInStock),
      description,
      category,
      image,
      user: req.user._id, // admin ka ID
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  addProduct,
};
