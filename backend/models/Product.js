const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
