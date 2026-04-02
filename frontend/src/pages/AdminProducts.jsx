import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Plus,
  Search,
  Package,
  ChevronRight,
} from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/products");
      setProducts(
        Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data)
            ? data
            : [],
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to load products";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete._id);
    setShowDeleteModal(false);

    try {
      await api.delete(`/products/${productToDelete._id}`);
      toast.success("Product deleted successfully", {
        icon: <Trash2 className="text-red-500" />,
      });
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
    } catch (err) {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // Ensure imagePath is string before checking startsWith
    const pathStr = typeof imagePath === "string" ? imagePath : "";
    // If already has full URL, return as is
    if (pathStr.startsWith("http")) return pathStr;
    // Otherwise prepend backend URL
    return `http://localhost:3000${pathStr}`;
  };

  // Skeleton
  const ProductSkeleton = () => (
    <div className="group relative bg-white dark:bg-gray-900/90 rounded-3xl shadow-xl border border-gray-100/50 dark:border-gray-800/50 overflow-hidden animate-pulse">
      <div className="relative h-72 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
      <div className="p-6 space-y-5">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black pb-24 mt-20">
      <Toaster position="top-center" richColors />

      {/* Floating Add Button */}
      <Link
        to="/admin/products/add"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              Manage Products
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              {products.length} products • Last updated:{" "}
              {new Date().toLocaleTimeString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-3 px-7 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-60 transition-all"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>

            <Link
              to="/admin/products/add"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search & Filter (placeholder) */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-12 pr-5 py-4 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm dark:text-white"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50/90 dark:bg-red-950/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200 dark:border-red-800 p-12 text-center max-w-2xl mx-auto"
          >
            <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-8" />
            <h2 className="text-3xl font-bold text-red-700 dark:text-red-400 mb-6">
              Error Loading Products
            </h2>
            <p className="text-xl text-red-600 dark:text-red-300 mb-10">
              {error}
            </p>
            <button
              onClick={fetchProducts}
              className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all hover:shadow-2xl"
            >
              Try Again
            </button>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-16 text-center max-w-2xl mx-auto"
          >
            <Package className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              No Products in Inventory
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
              Start adding products to your store right now.
            </p>
            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all"
            >
              <Plus className="w-6 h-6" />
              Add Your First Product
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="group relative bg-white dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:scale-[1.03] hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-500"
              >
                {/* Image with overlay */}
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <img
                    src={
                      getImageUrl(product.image) ||
                      `https://picsum.photos/seed/${product._id}/500/400`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/500x400?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-sm font-medium line-clamp-2">
                      {product.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-5">
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        product.countInStock > 10
                          ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                          : product.countInStock > 0
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 animate-pulse"
                      }`}
                    >
                      {product.countInStock > 0
                        ? `${product.countInStock} in stock`
                        : "Out of Stock"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="flex-1 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => confirmDelete(product)}
                      disabled={deletingId === product._id}
                      className={`p-3.5 rounded-2xl transition-all ${
                        deletingId === product._id
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {deletingId === product._id ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Trash2 className="w-6 h-6" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/40">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Delete Product?
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Are you sure you want to delete{" "}
                  <strong>"{productToDelete.name}"</strong>? This action cannot
                  be undone.
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-4 px-6 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deletingId === productToDelete._id}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-2xl transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {deletingId === productToDelete._id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Permanently"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
