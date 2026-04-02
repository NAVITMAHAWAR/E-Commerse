import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaTrash,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaHeart,
  FaTag,
  FaTruck,
  FaUndo,
  FaSave,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    applyPromoCode,
    calculateShipping,
    discount,
  } = useCart();

  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  // Dark mode toggle listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const checkoutHandler = () => navigate("/checkout");

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast.success(`${name} removed from cart!`, {
      icon: "🗑️",
      style: {
        background: isDarkMode ? "#1f2937" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      },
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared!", {
      icon: "🧹",
      style: {
        background: isDarkMode ? "#1f2937" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
      },
    });
  };

  const handlePromoApply = async () => {
    setLoadingPromo(true);
    const result = applyPromoCode(promoCode);
    setLoadingPromo(false);
    if (result.success) {
      toast.success(result.message, { icon: "🎟️" });
      setPromoCode("");
      setShowPromo(false);
    } else {
      toast.error(result.message, { icon: "❌" });
    }
  };

  const handleMoveToWishlist = (item) => {
    // Dummy wishlist move
    removeFromCart(item.product);
    toast.success(`${item.name} moved to wishlist!`, { icon: "❤️" });
  };

  const totalItems = useMemo(
    () =>
      Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + item.qty, 0)
        : 0,
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + item.qty * item.price, 0)
        : 0,
    [cartItems],
  );

  const discountedTotal = subtotal * (1 - discount);
  const shipping = calculateShipping(discountedTotal);
  const finalTotal = discountedTotal + shipping;

  // Free shipping progress
  const freeShippingThreshold = 999;
  const progress = Math.min(
    (discountedTotal / freeShippingThreshold) * 100,
    100,
  );
  const remainingForFree = freeShippingThreshold - discountedTotal;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#000000",
            borderRadius: "12px",
            border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between mb-10 bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-xl"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-4">
            <FaShoppingCart className="text-4xl" />
            <h1 className="text-3xl md:text-4xl font-bold">Your Cart</h1>
            <span className="ml-3 text-lg bg-white/20 px-4 py-1 rounded-full">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          <Link
            to="/"
            className="mt-4 sm:mt-0 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors text-lg font-medium"
          >
            <FaArrowLeft />
            Continue Shopping
          </Link>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FaShoppingCart className="text-8xl text-gray-300 dark:text-gray-600 mx-auto mb-8" />
            <h2 className="text-3xl font-bold mb-4">
              Your cart feels lonely 😔
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Add some awesome products to get started!
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-indigo-600 text-white px-10 py-4 rounded-full hover:bg-indigo-700 transition-all text-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaArrowLeft className="mr-3" />
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Promo Code Toggle */}
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <button
                  onClick={() => setShowPromo(!showPromo)}
                  className="w-full flex items-center justify-between text-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FaTag className="text-indigo-600" />
                    Have a promo code?
                  </div>
                  <span>{showPromo ? "−" : "+"}</span>
                </button>

                <AnimatePresence>
                  {showPromo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter promo code (e.g. SAVE10)"
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handlePromoApply}
                          disabled={loadingPromo || !promoCode.trim()}
                          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          {loadingPromo ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Free Shipping Progress */}
              {discountedTotal < 999 && (
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FaTruck className="text-green-600 text-xl" />
                    <h3 className="text-lg font-semibold">
                      Add ₹{remainingForFree.toLocaleString("en-IN")} more for{" "}
                      <span className="text-green-600">FREE Shipping!</span>
                    </h3>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Cart Items List */}
              <AnimatePresence>
                <motion.div
                  className="space-y-6"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.product}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl transition-shadow duration-300"
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 },
                        exit: { opacity: 0, x: -100, scale: 0.95 },
                      }}
                      exit="exit"
                    >
                      {/* Image */}
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl shadow-sm"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.product}`}
                          className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block mb-2 line-clamp-2"
                        >
                          {item.name}
                        </Link>

                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            x {item.qty}
                          </span>
                        </div>

                        {item.qty > item.countInStock && (
                          <p className="text-red-600 text-sm mb-2">
                            Only {item.countInStock} left in stock!
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                            <button
                              onClick={() => decreaseQty(item.product)}
                              disabled={item.qty <= 1}
                              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaMinus />
                            </button>
                            <span className="font-bold w-8 text-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => increaseQty(item.product)}
                              disabled={item.qty >= item.countInStock}
                              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm font-medium"
                          >
                            <FaHeart />
                            Move to Wishlist
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex flex-col items-end justify-between min-w-[140px]">
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ₹{(item.qty * item.price).toLocaleString("en-IN")}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Subtotal
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product, item.name)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-2 mt-4 text-sm font-medium transition-colors"
                        >
                          <FaTrash />
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Cart Actions */}
              <motion.div
                className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleClearCart}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FaTrash />
                  Clear Cart
                </button>

                <Link
                  to="/"
                  className="w-full sm:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <FaArrowLeft />
                  Continue Shopping
                </Link>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sticky top-8"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({discount * 100}%)</span>
                      <span>
                        -₹{(subtotal * discount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FaTruck />
                      Shipping
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  {/* <Divider className="my-4" /> */}

                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <motion.button
                  onClick={checkoutHandler}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all text-lg font-bold shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </motion.button>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                  Secure checkout • Free returns • 24/7 support
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
