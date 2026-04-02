import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  Divider,
  Avatar,
} from "@mui/material";
import {
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { Rate } from "antd";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";
import CountUp from "react-countup";

const CATEGORIES = [
  { id: "men", name: "Men's Fashion", icon: "👔", color: "#4F46E5" },
  { id: "women", name: "Women's Fashion", icon: "👗", color: "#EC4899" },
  { id: "electronics", name: "Electronics", icon: "📱", color: "#06B6D4" },
  { id: "accessories", name: "Accessories", icon: "💎", color: "#F59E0B" },
  { id: "footwear", name: "Footwear", icon: "👟", color: "#10B981" },
  { id: "watches", name: "Watches & Jewelry", icon: "⌚", color: "#8B5CF6" },
  { id: "sports", name: "Sports & Outdoors", icon: "⚽", color: "#EF4444" },
  { id: "home", name: "Home & Living", icon: "🏠", color: "#6366F1" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
  exit: { y: -20, opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const categoryCardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

const StarRating = ({ rating = 0, showCount = true, count = 0 }) => (
  <div className="flex items-center gap-2">
    <Rate
      disabled
      allowHalf
      defaultValue={rating}
      style={{ fontSize: 14, color: "#fbbf24" }}
    />
    {showCount && count > 0 && (
      <span className="text-sm text-gray-500">({count})</span>
    )}
  </div>
);

const PriceRangeSlider = ({ value, onChange }) => {
  const theme = useTheme();
  return (
    <Box sx={{ px: 1 }}>
      <Slider
        value={value}
        onChange={onChange}
        valueLabelDisplay="auto"
        min={0}
        max={10000}
        step={100}
        sx={{
          color: theme.palette.primary.main,
          height: 6,
          "& .MuiSlider-thumb": {
            width: 18,
            height: 18,
            "&:hover": { boxShadow: "0 0 0 8px rgba(99, 102, 241, 0.16)" },
          },
          "& .MuiSlider-track": { border: "none" },
          "& .MuiSlider-rail": { backgroundColor: "#e0e0e0" },
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          ₹{value[0].toLocaleString("en-IN")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ₹{value[1].toLocaleString("en-IN")}
        </Typography>
      </Box>
    </Box>
  );
};

const ProductSkeleton = () => (
  <Card sx={{ height: "100%", borderRadius: 4 }}>
    <Box sx={{ aspectRatio: "3/4", bgcolor: "grey.200" }} />
    <CardContent sx={{ p: 3 }}>
      <Typography
        sx={{ width: "80%", height: 24, mb: 1, bgcolor: "grey.200" }}
      />
      <Typography
        sx={{ width: "60%", height: 20, mb: 2, bgcolor: "grey.200" }}
      />
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Box
          sx={{ width: 60, height: 24, borderRadius: 1, bgcolor: "grey.200" }}
        />
        <Box
          sx={{ width: 60, height: 24, borderRadius: 1, bgcolor: "grey.200" }}
        />
      </Box>
      <Box
        sx={{ width: "100%", height: 48, borderRadius: 3, bgcolor: "grey.200" }}
      />
    </CardContent>
  </Card>
);

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgSeed] = useState(() => Math.floor(Math.random() * 10000));

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-xl">🛒</span>
        <span>{product.name?.slice(0, 30)} added!</span>
      </div>,
      { duration: 2500, iconTheme: { primary: "#4F46E5", secondary: "#fff" } },
    );
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-xl">❤️</span>
        <span>Added to wishlist!</span>
      </div>,
      { duration: 2000 },
    );
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      layout
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          border: "1px solid #e5e7eb",
          transition: "all 0.5s",
          "&:hover": {
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product._id}`}>
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <CardMedia
              component="img"
              image={
                imageError
                  ? `https://picsum.photos/seed/${imgSeed}/500/600`
                  : product.image ||
                    `https://picsum.photos/seed/${imgSeed}/500/600`
              }
              alt={product.name}
              onError={() => setImageError(true)}
              sx={{
                aspectRatio: "3/4",
                objectFit: "cover",
                transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.4s ease",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {discount > 0 && (
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
                >
                  <Chip
                    label={`-${discount}%`}
                    size="small"
                    sx={{
                      bgcolor: "#ef4444",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                      height: 26,
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                    }}
                  />
                </motion.div>
              )}
              {product.isNew && (
                <Chip
                  label="NEW"
                  size="small"
                  sx={{
                    bgcolor: "#10b981",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              )}
            </Box>
            <Box
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateX(0)" : "translateX(20px)",
                transition: "all 0.3s ease",
              }}
            >
              <IconButton
                onClick={handleWishlist}
                sx={{
                  bgcolor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" },
                }}
              >
                <HeartOutlined />
              </IconButton>
              <IconButton
                onClick={handleAddToCart}
                sx={{
                  bgcolor: "#4F46E5",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
              >
                <ShoppingCartOutlined />
              </IconButton>
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "white",
                  color: "#1f2937",
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#4F46E5", color: "white" },
                }}
              >
                Quick View
              </Button>
            </motion.div>
          </Box>
        </Link>
        <CardContent
          sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#6b7280",
              fontWeight: 500,
              textTransform: "uppercase",
              fontSize: "0.65rem",
              letterSpacing: 1,
            }}
          >
            {product.category || "Fashion"}
          </Typography>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              lineHeight: 1.4,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              color: "text.primary",
              "&:hover": { color: "#4F46E5" },
            }}
          >
            {product.name}
          </Typography>
          <StarRating
            rating={product.rating || 4.5}
            count={product.numReviews || 0}
          />
          <Box sx={{ mt: "auto", pt: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#4F46E5", fontSize: "1.35rem" }}
              >
                ₹
                <CountUp
                  end={product.price}
                  duration={1}
                  separator=","
                  preserveValue
                />
              </Typography>
              {product.originalPrice && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "#9ca3af",
                    textDecoration: "line-through",
                    fontSize: "0.95rem",
                  }}
                >
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </Typography>
              )}
            </Box>
            {product.countInStock > 0 ? (
              <Chip
                icon={<CheckCircleFilled style={{ color: "#059669" }} />}
                label={`${product.countInStock} in stock`}
                size="small"
                sx={{
                  bgcolor: "#ecfdf5",
                  color: "#059669",
                  fontWeight: 600,
                  width: "100%",
                  justifyContent: "flex-start",
                  borderRadius: 2,
                }}
              />
            ) : (
              <Chip
                label="Out of Stock"
                size="small"
                sx={{
                  bgcolor: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: 600,
                  width: "100%",
                  borderRadius: 2,
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CategoryCardComp = ({ category, index, onSelect, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      variants={categoryCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <Card
        onClick={() => onSelect(category.id)}
        sx={{
          cursor: "pointer",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: selected
            ? `2px solid ${category.color}`
            : "2px solid transparent",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          background: selected
            ? `linear-gradient(135deg, ${category.color}15, ${category.color}05)`
            : "white",
          "&:hover": { boxShadow: `0 20px 40px -12px ${category.color}40` },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: 180,
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 5 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${category.color}, ${category.color}80)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: `0 10px 30px -5px ${category.color}50`,
              fontSize: 32,
            }}
          >
            {category.icon}
          </motion.div>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              color: "#1f2937",
              mb: 0.5,
            }}
          >
            {category.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#6b7280", textAlign: "center", fontSize: "0.8rem" }}
          >
            Tap to explore
          </Typography>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <CheckCircleFilled
                style={{ color: category.color, fontSize: 20 }}
              />
            </motion.div>
          )}
        </Box>
      </Card>
    </motion.div>
  );
};

const CategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Filter change handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      const filters = getFilters();
      fetchProducts(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, priceRange, sortBy]);

  const fetchProducts = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getProducts(currentFilters);
      console.log("Category fetch response:", data);
      setProducts(Array.isArray(data.products) ? data.products : data || []);
    } catch (error) {
      setErrorMsg("Failed to load products");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilters = useCallback(
    () => ({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      q: searchQuery,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sort:
        {
          popular: "ratingHigh",
          newest: "newest",
          "price-low": "priceLow",
          "price-high": "priceHigh",
        }[sortBy] || "ratingHigh",
      inStock: inStock,
      page: page.toString(),
      limit: "48",
    }),
    [selectedCategory, searchQuery, priceRange, sortBy, inStock, page],
  );

  useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      const filters = getFilters();
      fetchProducts(filters);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [getFilters, fetchProducts]);

  // Server-side filtering, products already filtered

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setPriceRange([0, 10000]);
    setSortBy("popular");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };
  const activeFiltersCount = [
    selectedCategory !== "all",
    searchQuery,
    priceRange[0] > 0 || priceRange[1] < 10000,
  ].filter(Boolean).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", pb: 8 }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: "16px", background: "#1f2937", color: "#fff" },
        }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: { xs: 6, md: 10 },
          mb: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              style={{
                position: "absolute",
                width: 200 + i * 100,
                height: 200 + i * 100,
                borderRadius: "50%",
                background: "white",
                left: `${10 + i * 20}%`,
                top: `${20 + i * 15}%`,
                filter: "blur(80px)",
              }}
            />
          ))}
        </Box>
        <Box sx={{ position: "relative", maxWidth: 1200, mx: "auto", px: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
                textShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              Shop by Category
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                fontWeight: 500,
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Discover amazing products across different categories
            </Typography>
          </motion.div>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <motion.div variants={itemVariants}>
                <Card
                  onClick={() => handleCategorySelect("all")}
                  sx={{
                    cursor: "pointer",
                    height: "100%",
                    borderRadius: 4,
                    border:
                      selectedCategory === "all"
                        ? "2px solid #667eea"
                        : "2px solid transparent",
                    bgcolor:
                      selectedCategory === "all"
                        ? "rgba(102, 126, 234, 0.1)"
                        : "white",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 10px 30px -5px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      minHeight: 140,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#667eea",
                        width: 56,
                        height: 56,
                        mb: 1.5,
                        fontSize: 24,
                      }}
                    >
                      🏪
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, textAlign: "center" }}
                    >
                      All
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
            {CATEGORIES.map((category, index) => (
              <Grid key={category.id} size={{ xs: 6, sm: 4, md: 2 }}>
                <CategoryCardComp
                  category={category}
                  index={index}
                  onSelect={handleCategorySelect}
                  selected={selectedCategory === category.id}
                />
              </Grid>
            ))}
          </Grid>
        </motion.div>
        <Box sx={{ mt: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: "white",
              borderRadius: 4,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                placeholder="Search products..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined style={{ color: "#9ca3af" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: "100%", md: 280 },
                  "& .MuiOutlinedInput-root": { borderRadius: 3 },
                }}
              />
              {isMobile && (
                <Button
                  variant="outlined"
                  startIcon={<FilterOutlined />}
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{ borderRadius: 3 }}
                >
                  Filters{" "}
                  {activeFiltersCount > 0 && (
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                      sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Button>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {products.length} products found
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 0.5,
                  bgcolor: "#f3f4f6",
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setViewMode("grid")}
                  sx={{
                    bgcolor: viewMode === "grid" ? "white" : "transparent",
                    boxShadow: viewMode === "grid" ? 1 : 0,
                  }}
                >
                  <AppstoreOutlined />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setViewMode("list")}
                  sx={{
                    bgcolor: viewMode === "list" ? "white" : "transparent",
                    boxShadow: viewMode === "list" ? 1 : 0,
                  }}
                >
                  <UnorderedListOutlined />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Drawer
            anchor="right"
            open={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            PaperProps={{ sx: { width: 300, p: 3 } }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Filters
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Price Range
            </Typography>
            <PriceRangeSlider
              value={priceRange}
              onChange={(e, v) => setPriceRange(v)}
            />
            <Divider sx={{ my: 3 }} />
            <Button
              fullWidth
              variant="contained"
              onClick={() => setMobileFilterOpen(false)}
              sx={{ borderRadius: 3, mb: 2 }}
            >
              Apply Filters
            </Button>
            <Button fullWidth variant="outlined" onClick={clearFilters}>
              Clear All
            </Button>
          </Drawer>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(12)].map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                  <ProductSkeleton />
                </Grid>
              ))}
            </Grid>
          ) : errorMsg ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "white",
                borderRadius: 4,
              }}
            >
              <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                {errorMsg}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "white",
                borderRadius: 4,
              }}
            >
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                No products found
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or search query
              </Typography>
              <Button variant="contained" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Box>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <Grid
                      key={product._id}
                      size={{
                        xs: 6,
                        sm: viewMode === "grid" ? 4 : 12,
                        md: viewMode === "grid" ? 3 : 12,
                        lg: viewMode === "grid" ? 2 : 12,
                      }}
                    >
                      <ProductCard product={product} index={index} />
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </motion.div>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryPage;
