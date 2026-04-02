import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";

// ============================================
// CONFIGURATION & UTILITIES
// ============================================

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -12,
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

// Image error handler with fallback
const getImageUrl = (image, index = 0) => {
  if (image) return image;
  const categories = [
    "shirt",
    "pant",
    "tshirt",
    "dress",
    "jacket",
    "shoes",
    "watch",
    "bag",
  ];
  return `https://loremflickr.com/600/800/${categories[index % categories.length]}?random=${Math.random()}`;
};

// ============================================
// COMPONENTS
// ============================================

// Enhanced Star Rating with half stars
const StarRating = ({ rating = 0, showCount = false, reviewCount = 0 }) => {
  // Validate and sanitize rating - handle undefined, NaN, Infinity, and out-of-range values
  const sanitizedRating = (() => {
    if (
      rating === undefined ||
      rating === null ||
      isNaN(rating) ||
      !isFinite(rating)
    ) {
      return 0;
    }
    const numRating = Number(rating);
    if (numRating < 0 || numRating > 5) {
      return Math.max(0, Math.min(5, numRating));
    }
    return numRating;
  })();

  const fullStars = Math.floor(sanitizedRating);
  const hasHalf = sanitizedRating % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalf && (
        <svg className="w-4 h-4" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d1d5db" />
            </linearGradient>
          </defs>
          <path
            fill="url(#halfGradient)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showCount && (
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
};

// Skeleton Loader
const ProductSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
  </div>
);

// Category Card
const CategoryCard = ({ category }) => (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="group relative overflow-hidden rounded-3xl aspect-square"
  >
    <img
      src={category.image}
      alt={category.name}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
        {category.name}
      </h3>
      <span className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        Shop Now →
      </span>
    </div>
  </motion.div>
);

// Benefits Bar
const BenefitsBar = () => (
  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 py-6">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          {
            icon: "🚚",
            title: "Free Shipping",
            subtitle: "On orders above ₹500",
          },
          {
            icon: "↩️",
            title: "Easy Returns",
            subtitle: "30-day return policy",
          },
          {
            icon: "🔒",
            title: "Secure Payment",
            subtitle: "100% secure checkout",
          },
          {
            icon: "💬",
            title: "24/7 Support",
            subtitle: "Dedicated support team",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="flex flex-col items-center text-white"
          >
            <span className="text-3xl mb-1">{item.icon}</span>
            <span className="font-bold text-sm md:text-base">{item.title}</span>
            <span className="text-xs opacity-80">{item.subtitle}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Deal Card
const DealCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;
  const timeLeft = Math.max(0, 24 - index * 3);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`, { icon: "🛒" });
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
    >
      <div className="absolute top-3 left-3 z-20">
        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
          {timeLeft}h left
        </span>
      </div>
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-20">
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full">
            {discount}% OFF
          </span>
        </div>
      )}

      <Link to={`/product/${product._id}`} className="block">
        <div className="aspect-square overflow-hidden">
          <img
            src={getImageUrl(product.image, index)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating || 4.5} />
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

// Testimonial Card
const TestimonialCard = ({ testimonial }) => (
  <motion.div
    variants={fadeInUp}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800"
  >
    <div className="flex items-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
    <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
      "{testimonial.text}"
    </p>
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
        {testimonial.name.charAt(0)}
      </div>
      <div>
        <h5 className="font-semibold text-gray-900 dark:text-white">
          {testimonial.name}
        </h5>
        <p className="text-sm text-gray-500">{testimonial.location}</p>
      </div>
    </div>
  </motion.div>
);

// Newsletter Section
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      toast.success("Thanks for subscribing! 🎉");
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-500 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-300 mb-8">
            Get exclusive offers and updates straight to your inbox!
          </p>
          {subscribed ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500/20 text-green-300 px-6 py-4 rounded-2xl inline-block"
            >
              🎉 Thanks for subscribing!
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// Main Product Card
const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(
      <div className="flex items-center gap-2">
        <span className="text-xl">🛍️</span>
        <span>{product.name} added to cart!</span>
      </div>,
      { duration: 2000 },
    );
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-indigo-500/30 transition-all duration-300"
    >
      <Link to={`/product/${product._id}`} className="block relative">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={getImageUrl(product.image, index)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = getImageUrl(null, index);
            }}
          />

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 5 && (
              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-md">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            className="absolute top-3 right-3 w-10 h-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-red-500 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md"
            aria-label="Add to wishlist"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </Link>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        <div className="flex items-center justify-between mb-3">
          <StarRating
            rating={product.rating || 4.5}
            showCount
            reviewCount={product.numReviews || 0}
          />
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice?.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Add to cart"
          >
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN HOME COMPONENT
// ============================================

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts();
        if (mounted) {
          if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts(Array.isArray(data) ? data : []);
          }
        }

      } catch {
        if (mounted)
          setError("Unable to load products. Please try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Get featured and latest products
  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.slice(8, 16).filter((p) => p.price < 1000);
  const newArrivals = products.slice(0, 12);

  // Categories data
  const categories = [
    {
      name: "Men",
      image: "https://loremflickr.com/400/400/man,fashion?random=1",
    },
    {
      name: "Women",
      image: "https://loremflickr.com/400/400/woman,fashion?random=2",
    },
    {
      name: "Kids",
      image: "https://loremflickr.com/400/400/kids,clothing?random=3",
    },
    {
      name: "Accessories",
      image: "https://loremflickr.com/400/400/accessories,watch?random=4",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Rahul Sharma",
      location: "Mumbai",
      text: "Amazing quality and fast delivery! Will definitely order again.",
    },
    {
      name: "Priya Patel",
      location: "Delhi",
      text: "Best online shopping experience. The products are exactly as shown.",
    },
    {
      name: "Amit Kumar",
      location: "Bangalore",
      text: "Great customer service and excellent product quality.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 mt-20">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#1f2937",
            color: "#fff",
            padding: "16px 24px",
          },
        }}
      />

      {/* Benefits Bar */}
      <BenefitsBar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-600"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-6 py-24 md:py-36 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6"
            >
              ✨ New Collection 2024
            </motion.span>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
            >
              Style That Speaks
              <span className="block text-yellow-300">Volumes</span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            >
              Discover the latest trends in fashion with our exclusive
              collection. Up to{" "}
              <span className="font-bold text-yellow-300">70% OFF</span> on
              selected items!
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/shop"
                className="px-10 py-4 bg-white text-indigo-700 font-bold text-lg rounded-full shadow-2xl hover:bg-yellow-300 hover:text-indigo-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Shop Now →
              </Link>
              <Link
                to="/deals"
                className="px-10 py-4 bg-transparent border-2 border-white/50 text-white font-bold text-lg rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                Flash Deals ⚡
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-gray-50 dark:text-gray-950"
            />
          </svg>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">
              Oops!
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Shop by Category</h2>
            <Link
              to="/category"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} category={cat} index={idx} />
            ))}
          </motion.div>
        </motion.section>

        {/* Featured Products */}
        {!loading && featuredProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Handpicked just for you
                </p>
              </div>
              <Link
                to="/shop?sort=popular"
                className="hidden md:block text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {featuredProducts.map((product, idx) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
            <div className="mt-6 text-center md:hidden">
              <Link
                to="/shop"
                className="text-indigo-600 dark:text-indigo-400 font-medium"
              >
                View All Products →
              </Link>
            </div>
          </motion.section>
        )}

        {/* Deals Section */}
        {!loading && dealProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Today's Deals
                </h2>
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                  ⚡ HOT
                </span>
              </div>
              <Link
                to="/deals"
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View All →
              </Link>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {dealProducts.map((product, idx) => (
                <DealCard key={product._id} product={product} index={idx} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* Banner Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 md:p-16">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Flat 50% Off On Summer Collection
              </h2>
              <p className="text-white/80 mb-6">
                Don't miss out on our biggest sale of the season. Limited time
                offer!
              </p>
              <Link
                to="/shop?category=summer"
                className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </motion.section>

        {/* New Arrivals */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                New Arrivals
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Fresh styles added daily
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-2xl font-bold mb-2">No products yet...</h3>
              <p className="text-gray-500">Check back soon for new arrivals!</p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {newArrivals.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              What Our Customers Say
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Join thousands of happy customers
            </p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </motion.div>
        </motion.section>

        {/* Trust Badges */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🛡️",
                title: "Secure Checkout",
                desc: "256-bit SSL encryption",
              },
              {
                icon: "🚚",
                title: "Fast Delivery",
                desc: "Free shipping over ₹500",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: "💯",
                title: "Quality Guarantee",
                desc: "100% original products",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800"
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};

export default Home;
