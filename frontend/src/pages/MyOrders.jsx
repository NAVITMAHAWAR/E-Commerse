import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOrders, downloadInvoice } from "../api/orderApi";
import toast, { Toaster } from "react-hot-toast";
import { format } from "date-fns";
import api from "../api/axios";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react"; // npm install lucide-react

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error("MyOrders fetch error:", err);
        setError("Orders load nahi ho paye. Thodi der baad try karo.");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Status steps for timeline
  const getStatusSteps = (order) => {
    return [
      {
        label: "Placed",
        icon: ShoppingBag,
        active: true,
        date: order.createdAt,
      },
      {
        label: "Paid",
        icon: CreditCard,
        active: order.isPaid,
        date: order.isPaid ? order.updatedAt : null,
      },
      {
        label: "Shipped",
        icon: Truck,
        active: order.isDelivered,
        date: order.isDelivered ? order.updatedAt : null,
      },
      {
        label: "Delivered",
        icon: CheckCircle2,
        active: order.isDelivered,
        date: order.isDelivered ? order.updatedAt : null,
      },
    ];
  };

  // Skeleton
  const OrderSkeleton = () => (
    <div className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-pulse border border-gray-100/30 dark:border-gray-700/30">
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-56" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
        <div className="pt-4 border-t dark:border-gray-700/50">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6" />
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" richColors />

      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black text-center text-gray-900 dark:text-white mb-16 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          My Orders
        </motion.h1>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[...Array(2)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-50/90 to-red-100/60 dark:from-red-950/70 dark:to-red-900/50 backdrop-blur-xl border border-red-200/80 dark:border-red-800/60 rounded-3xl p-16 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-red-700 dark:text-red-400 mb-6">
              Something went wrong
            </h2>
            <p className="text-xl text-red-600 dark:text-red-300 mb-10">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xl shadow-lg transition-all hover:shadow-2xl transform hover:scale-[1.02]"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-16 lg:p-20 text-center border border-gray-100/50 dark:border-gray-700/40"
          >
            <ShoppingBag
              className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-8"
              strokeWidth={1.2}
            />
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              No Orders Placed Yet
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Your order history will appear here once you make your first
              purchase. Start exploring now!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-[1.03]"
            >
              <ShoppingBag className="w-6 h-6" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const steps = getStatusSteps(order);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="group bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-100/40 dark:border-gray-700/40 overflow-hidden hover:shadow-3xl hover:scale-[1.005] transition-all duration-500"
                >
                  {/* Header */}
                  <div
                    onClick={() => toggleExpand(order._id)}
                    className="p-7 lg:p-9 cursor-pointer bg-gradient-to-r from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90 hover:from-gray-100/90 hover:to-white/90 dark:hover:from-gray-700/90 dark:hover:to-gray-800/90 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl">
                            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-base text-gray-600 dark:text-gray-300">
                              {format(
                                new Date(order.createdAt),
                                "dd MMMM yyyy • hh:mm a",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-3">
                          <span
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm ${
                              order.isPaid
                                ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                            }`}
                          >
                            {order.isPaid ? "Paid" : "Awaiting Payment"}
                          </span>
                          <span
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm ${
                              order.isDelivered
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300"
                            }`}
                          >
                            {order.isDelivered ? "Delivered" : "In Progress"}
                          </span>
                        </div>

                        <div className="text-right lg:text-left">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Amount
                          </p>
                          <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{order.totalPrice.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-8 hidden lg:flex items-center justify-between relative">
                      <div className="absolute left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full top-1/2 -translate-y-1/2" />
                      <div className="flex justify-between w-full relative z-10">
                        {steps.map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                step.active
                                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              <step.icon className="w-6 h-6" />
                            </div>
                            <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {format(new Date(step.date), "dd MMM")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-7 lg:p-9 bg-gradient-to-b from-transparent via-gray-50/40 to-gray-100/40 dark:via-gray-800/30 dark:to-gray-900/30">
                          <div className="flex items-center justify-between mb-8">
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                              <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                              Order Items ({order.orderItems.length})
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Click header to collapse
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {order.orderItems.map((item) => (
                              <motion.div
                                key={item.product}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md group"
                              >
                                <div className="flex gap-5">
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={
                                        item.image ||
                                        `https://picsum.photos/seed/${item.product}/120/120`
                                      }
                                      alt={item.name}
                                      className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-indigo-400 transition-all"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://placehold.co/120x120?text=No+Img";
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition" />
                                  </div>

                                  <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                      <Link
                                        to={`/product/${item.product}`}
                                        className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-2"
                                      >
                                        {item.name}
                                      </Link>
                                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">
                                          Qty: {item.qty}
                                        </span>
                                        <span className="font-medium">
                                          ₹{item.price.toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-4">
                                      <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                                        ₹
                                        {(item.qty * item.price).toLocaleString(
                                          "en-IN",
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="px-7 lg:px-9 py-6 bg-gray-50/70 dark:bg-gray-800/50 border-t dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-sm">
                      <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Paid via{" "}
                        <strong className="text-gray-900 dark:text-white">
                          {order.paymentMethod}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <Link
                        to={`/order/${order._id}`}
                        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition"
                      >
                        View Full Order
                        <ChevronRight className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <ChevronUp className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            Show Details
                            <ChevronDown className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      <button onClick={() => downloadInvoice(order._id)}>
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
