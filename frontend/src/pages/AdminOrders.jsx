import React, { useState, useEffect } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ShoppingBag,
  Truck,
} from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/orders/my"); // ← Admin ke liye sab orders (my nahi)
      setOrders(data || []);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to load orders";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markDelivered = async (orderId) => {
    if (processingId === orderId) return;

    setProcessingId(orderId);
    try {
      await api.put(`/orders/${orderId}/deliver`);
      toast.success("Order marked as Delivered ✅", {
        icon: <CheckCircle className="text-green-500" />,
      });

      // Refresh list
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, isDelivered: true } : o)),
      );
    } catch (err) {
      toast.error("Failed to update order status");
    } finally {
      setProcessingId(null);
    }
  };

  const updateStatus = async (id, status) => {
    if (processingId === id) return;

    setProcessingId(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === id
            ? { ...o, status, isDelivered: status === "Delivered" }
            : o,
        ),
      );
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  // Skeleton loader card
  const OrderSkeleton = () => (
    <div className="bg-white dark:bg-gray-900/90 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ duration: 4000 }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin - All Orders
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Manage & update customer orders •{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            Refresh Orders
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50/90 dark:bg-red-950/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 dark:border-red-800 p-12 text-center max-w-2xl mx-auto"
          >
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-xl text-red-600 dark:text-red-300 mb-8">
              {error}
            </p>
            <button
              onClick={fetchOrders}
              className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:shadow-2xl"
            >
              Retry
            </button>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-16 text-center"
          >
            <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              No Orders Yet
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
              When customers start placing orders, they'll appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Order Header */}
                <div className="p-6 lg:p-8 bg-gradient-to-r from-gray-50/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90 border-b dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Order ID
                      </p>
                      <p className="font-mono font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.user?.name || order.user?.email || "Guest"} •{" "}
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <span
                        className={`px-6 py-2 rounded-full text-sm font-semibold shadow-sm ${
                          order.isPaid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending Payment"}
                      </span>

                      <span
                        className={`px-6 py-2 rounded-full text-sm font-semibold shadow-sm ${
                          order.status === "Delivered" || order.isDelivered
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                        }`}
                      >
                        {order.status ||
                          (order.isDelivered ? "Delivered" : "Processing")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 text-sm">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-300">
                        Total Amount:
                      </span>{" "}
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">
                        ₹{order.totalPrice?.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-300">
                        Payment:
                      </span>{" "}
                      {order.paymentMethod || "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="p-6 lg:p-8 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/30">
                  {order.isDelivered || order.status === "Delivered" ? (
                    <div className="w-full md:w-auto px-10 py-4 rounded-2xl font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-center flex items-center justify-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      Delivered ✅
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {[
                        {
                          label: "Processing",
                          Icon: Clock,
                          color: "from-orange-500 to-orange-600",
                          hoverColor: "from-orange-600 to-orange-700",
                        },
                        {
                          label: "Shipped",
                          Icon: Truck,
                          color: "from-blue-500 to-blue-600",
                          hoverColor: "from-blue-600 to-blue-700",
                        },
                        {
                          label: "Out for Delivery",
                          Icon: Truck,
                          color: "from-purple-500 to-purple-600",
                          hoverColor: "from-purple-600 to-purple-700",
                        },
                        {
                          label: "Delivered",
                          Icon: CheckCircle,
                          color: "from-green-500 to-emerald-600",
                          hoverColor: "from-green-600 to-emerald-700",
                        },
                      ].map(({ label, Icon, color, hoverColor }) => (
                        <motion.button
                          key={label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateStatus(order._id, label)}
                          disabled={processingId === order._id}
                          className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-sm hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r ${color} hover:bg-gradient-to-r ${hoverColor}`}
                        >
                          {processingId === order._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
