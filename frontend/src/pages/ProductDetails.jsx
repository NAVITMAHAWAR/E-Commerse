import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { getProductById } from "../api/productApi";
import toast, { Toaster } from "react-hot-toast";

import {
  FaHeart,
  FaShareAlt,
  FaWhatsapp,
  FaTwitter,
  FaCopy,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaStarHalfAlt,
  FaShoppingCart,
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRupeeSign,
} from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setInWishlist(localStorage.getItem(`wishlist_${id}`) === "true");
      } catch (err) {
        setError("Product nahi mila ya load nahi ho paya.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => {
    if (product.countInStock < qty) {
      toast.error(`Sirf ${product.countInStock} items bache hain!`);
      return;
    }
    addToCart(product, Number(qty));
    toast.success(`${qty} × ${product.name} cart mein daal diya!`, {
      icon: "🛒",
    });
    navigate("/cart");
  };

  const toggleWishlist = () => {
    const newValue = !inWishlist;
    setInWishlist(newValue);
    localStorage.setItem(`wishlist_${id}`, newValue.toString());
    toast.success(
      newValue ? "Wishlist mein daal diya ❤️" : "Wishlist se hata diya",
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copy ho gaya!");
  };

  const shareOnWhatsApp = () => {
    const text = `Dekho yeh mast product: ${product.name}\nSirf ₹${product.price}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = `Just found this awesome product: ${product.name} for ₹${product.price}! ${window.location.href}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % (product.images?.length || 1));
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) =>
        (prev - 1 + (product.images?.length || 1)) %
        (product.images?.length || 1),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-gray-700">
            Loading your favorite product...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Oops!</h2>
          <p className="text-lg text-gray-700 mb-8">
            {error || "Product nahi mila."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-10 py-4 rounded-full hover:from-indigo-700 hover:to-purple-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const clothingImages = [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800",
    "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
    "https://images.unsplash.com/photo-1607345366928-199ea5fe3a09?w=800",
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800",
    "https://images.unsplash.com/photo-1618354691552-1205a225f723?w=800",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
  ];

  // Example usage: random image
  const randomImage =
    clothingImages[Math.floor(Math.random() * clothingImages.length)];

  const images = product.images?.length ? product.images : [product.image];
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-sm font-medium text-gray-600">
            <Link
              to="/"
              className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <FaArrowLeft className="text-xs" /> Home
            </Link>
            <span className="mx-3 text-gray-400">/</span>
            <Link
              to="/shop"
              className="hover:text-indigo-600 transition-colors"
            >
              Shop
            </Link>
            <span className="mx-3 text-gray-400">/</span>
            <span className="text-indigo-700 truncate max-w-[180px]">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
            {/* Images Section */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-gray-200/50 bg-white group">
                <img
                  src={images[currentImage]}
                  alt={product.name}
                  className="w-full h-[500px] md:h-[600px] lg:h-[680px] object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-4 rounded-full shadow-xl hover:bg-white transition-all opacity-80 hover:opacity-100"
                    >
                      <FaChevronLeft className="text-gray-800 text-xl" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-md p-4 rounded-full shadow-xl hover:bg-white transition-all opacity-80 hover:opacity-100"
                    >
                      <FaChevronRight className="text-gray-800 text-xl" />
                    </button>
                  </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 mt-6 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 snap-center transition-all duration-300 ${
                          currentImage === idx
                            ? "border-indigo-600 scale-105 shadow-lg"
                            : "border-transparent hover:border-indigo-400"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              className="flex flex-col order-1 lg:order-2"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Title + Badges */}
              <div className="flex flex-col gap-3 mb-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                <div className="flex flex-wrap gap-3">
                  {discount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md animate-pulse">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-1.5 rounded-full">
                    In Stock: {product.countInStock}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => {
                    const isHalf =
                      i < product.rating && i + 0.5 >= product.rating;
                    return isHalf ? (
                      <FaStarHalfAlt key={i} className="fill-current" />
                    ) : (
                      <FaStar
                        key={i}
                        className={
                          i < Math.floor(product.rating || 4.5)
                            ? "fill-current"
                            : ""
                        }
                      />
                    );
                  })}
                </div>
                <span className="text-gray-600 font-medium">
                  {product.rating || 4.5} ({product.numReviews || 142} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-black text-indigo-700 tracking-tight">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.originalPrice && (
                    <span className="text-2xl md:text-3xl text-gray-500 line-through opacity-80">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="text-lg font-semibold text-green-600">
                    You save ₹
                    {(product.originalPrice - product.price).toLocaleString(
                      "en-IN",
                    )}{" "}
                    ({discount}%)
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-lg text-gray-700 mb-10 leading-relaxed">
                <p>
                  {product.description ||
                    "Premium quality product with excellent features and long-lasting performance."}
                </p>
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-col sm:flex-row gap-6 mb-10">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-800 text-lg">
                    Quantity:
                  </label>
                  <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setQty((p) => Math.max(1, p - 1))}
                      className="px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
                      disabled={qty <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="px-8 py-4 font-bold text-xl w-20 text-center border-x border-gray-300">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((p) => p + 1)}
                      className="px-5 py-4 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50"
                      disabled={qty >= product.countInStock}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Wishlist */}
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 font-bold text-lg transition-all duration-300 ${
                    inWishlist
                      ? "bg-red-50 border-red-400 text-red-600 hover:bg-red-100"
                      : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  <FaHeart
                    className={`${inWishlist ? "text-red-500 fill-current" : "text-gray-500"} text-xl transition-transform ${inWishlist ? "scale-125" : ""}`}
                  />
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* Add to Cart - Floating style */}
              <motion.button
                onClick={addToCartHandler}
                disabled={product.countInStock === 0}
                className={`w-full py-5 rounded-2xl text-xl font-extrabold shadow-2xl transition-all flex items-center justify-center gap-4 sticky bottom-6 lg:static z-10 ${
                  product.countInStock > 0
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-2xl hover:scale-[1.02]"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                whileHover={product.countInStock > 0 ? { scale: 1.03 } : {}}
                whileTap={product.countInStock > 0 ? { scale: 0.97 } : {}}
              >
                <FaShoppingCart className="text-2xl" />
                {product.countInStock > 0 ? "Add to Cart" : "Out of Stock"}
              </motion.button>

              {/* Share */}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  <FaWhatsapp className="text-xl" /> WhatsApp
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="flex items-center gap-3 px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FaTwitter className="text-xl" /> Twitter
                </button>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-3 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                >
                  <FaCopy className="text-xl" /> Copy Link
                </button>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          <div className="mt-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
              You May Also Love These
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={randomImage}
                      alt="Related"
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <button className="w-full bg-white/90 text-gray-900 py-3 rounded-xl font-bold hover:bg-white transition-colors">
                        Quick Add
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2">
                      Related Product {i}
                    </h3>
                    <p className="text-indigo-700 font-bold text-xl">₹2,499</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
