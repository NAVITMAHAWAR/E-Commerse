import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

// Animation variants for smooth transitions
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCarts } = useCart();
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash On Delivery");

  // Calculate totals dynamically
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );
  const shipping = subtotal > 500 ? 0 : 50; // ₹500 se upar free shipping
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  // Form validation
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!shippingAddress.address.trim())
      newErrors.address = "Address zaroori hai";
    if (!shippingAddress.city.trim()) newErrors.city = "City zaroori hai";
    if (!shippingAddress.postalCode.trim())
      newErrors.postalCode = "Postal code zaroori hai";
    if (!shippingAddress.country.trim())
      newErrors.country = "Country zaroori hai";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRazorpay = async (orderData) => {
    try {
      const { data: razorpayOrder } = await api.post(
        "/orders/create-razorpay-order",
        {
          amount: total,
          orderId: orderData._id,
        },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SMKRG47GYeRgRu",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Navit E-commerce",
        description: "Test Transaction",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post("/orders/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData._id,
            });
            toast.success("Payment Successful! 🎉", {
              duration: 4000,
              style: {
                background: "#10b981",
                color: "white",
                borderRadius: "12px",
              },
            });
            clearCarts();
            navigate("/myorders");
          } catch (error) {
            toast.error("Payment verification failed!", {
              duration: 4000,
              style: {
                background: "#ef4444",
                color: "white",
                borderRadius: "12px",
              },
            });
          }
        },
        prefill: { name: shippingAddress.address, email: "", contact: "" },
        theme: { color: "#6366f1" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment initiation failed!", {
        duration: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "12px" },
      });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        totalPrice: total,
        subtotal,
        shipping,
        tax,
      });

      if (paymentMethod === "Razorpay") {
        await handleRazorpay(data);
        setLoading(false);
        return;
      }

      console.log(data);
      toast.success("Order Successfully Ban Gaya! 🎉", {
        duration: 4000,
        style: { background: "#10b981", color: "white", borderRadius: "12px" },
      });
      clearCarts();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Order banane mein error", {
        duration: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "12px" },
      });
    } finally {
      setLoading(false);
    }
  };

  // Agar cart empty hai to home pe redirect
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <Toaster position="top-right" />
      <motion.div
        className="container mx-auto px-6 max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-12"
          variants={itemVariants}
        >
          Secure Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={item.image || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold text-indigo-600">
                    ₹{(item.qty * item.price).toLocaleString("en-IN")}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST):</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </motion.div>

          {/* Checkout Form */}
          <motion.form
            onSubmit={submitHandler}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-8"
            variants={itemVariants}
          >
            {/* Shipping Address */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Shipping Address
              </h3>
              <div className="space-y-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.address}
                    placeholder="Apna full address daalo"
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        address: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.address
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Apni city daalo"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.city
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      placeholder="Postal code daalo"
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          postalCode: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        errors.postalCode
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-indigo-200"
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="Apna country daalo"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 transition-all ${
                        errors.country
                          ? "border-red-300 focus:ring-red-200"
                          : "border-gray-300 focus:ring-indigo-200"
                      }`}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.country}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Payment Method
              </h3>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all"
              >
                <option value="Cash On Delivery">Cash On Delivery</option>
                <option value="Razorpay">Razorpay (Online Payment)</option>
              </select>
            </motion.div>

            {/* Place Order Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Place Order"
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
