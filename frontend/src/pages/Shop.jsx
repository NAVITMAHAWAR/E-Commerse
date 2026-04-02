import React, { useState, useEffect, useMemo } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  SearchOutlined,
  FilterOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  CheckCircleFilled,
  CloseOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Rate } from "antd";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";
import CountUp from "react-countup";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.96 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
  exit: { y: -20, opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const FILTER_CATEGORIES = [
  { id: "all", name: "All Products", icon: "🏪" },
  { id: "men", name: "Men's", icon: "👔" },
  { id: "women", name: "Women's", icon: "👗" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "accessories", name: "Accessories", icon: "💎" },
  { id: "footwear", name: "Footwear", icon: "👟" },
];

const StarRating = ({ rating = 0, count = 0 }) => (
  <div className="flex items-center gap-1">
    <Rate
      disabled
      allowHalf
      defaultValue={rating}
      style={{ fontSize: 12, color: "#fbbf24" }}
    />
    {count > 0 && <span className="text-xs text-gray-400 ml-1">({count})</span>}
  </div>
);

const PriceRangeSlider = ({ value, onChange }) => (
  <Box sx={{ px: 1 }}>
    <Slider
      value={value}
      onChange={onChange}
      valueLabelDisplay="auto"
      min={0}
      max={10000}
      step={100}
      sx={{
        color: "#6366f1",
        height: 6,
        "& .MuiSlider-thumb": { width: 18, height: 18 },
        "& .MuiSlider-track": { border: "none" },
        "& .MuiSlider-rail": { backgroundColor: "#e5e7eb" },
      }}
    />
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.75rem" }}
      >
        ₹{value[0].toLocaleString("en-IN")}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.75rem" }}
      >
        ₹{value[1].toLocaleString("en-IN")}
      </Typography>
    </Box>
  </Box>
);

const ProductSkeleton = () => (
  <Card sx={{ height: "100%", borderRadius: 4, border: "1px solid #f3f4f6" }}>
    <Box sx={{ aspectRatio: "4/5", bgcolor: "#f3f4f6" }} />
    <CardContent sx={{ p: 2.5 }}>
      <Box
        sx={{
          width: "60%",
          height: 16,
          bgcolor: "#f3f4f6",
          borderRadius: 1,
          mb: 1.5,
        }}
      />
      <Box
        sx={{
          width: "40%",
          height: 14,
          bgcolor: "#f3f4f6",
          borderRadius: 1,
          mb: 2,
        }}
      />
      <Box
        sx={{ width: "80%", height: 28, bgcolor: "#f3f4f6", borderRadius: 2 }}
      />
    </CardContent>
  </Card>
);

const ProductCard = ({ product, index, viewMode = "grid" }) => {
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
      <div className="flex items-center gap-2">
        <span>🛒</span>
        <span>{product.name?.slice(0, 25)} added!</span>
      </div>,
      { duration: 2500 },
    );
  };
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(<span>❤️ Added to wishlist!</span>, { duration: 2000 });
  };

  if (viewMode === "list") {
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        custom={index}
      >
        <Card
          sx={{
            display: "flex",
            borderRadius: 4,
            overflow: "hidden",
            transition: "all 0.3s",
            "&:hover": { boxShadow: "0 12px 24px rgba(0,0,0,0.08)" },
          }}
        >
          <Link to={`/product/${product._id}`}>
            <Box
              sx={{
                position: "relative",
                width: 180,
                height: 220,
                flexShrink: 0,
              }}
            >
              <CardMedia
                component="img"
                image={
                  imageError
                    ? `https://picsum.photos/seed/${imgSeed}/300/400`
                    : product.image ||
                      `https://picsum.photos/seed/${imgSeed}/300/400`
                }
                alt={product.name}
                onError={() => setImageError(true)}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {discount > 0 && (
                <Chip
                  label={`-${discount}%`}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    bgcolor: "#ef4444",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              )}
            </Box>
          </Link>
          <CardContent
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#6366f1",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              {product.category || "Fashion"}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                mb: 1,
                color: "#111827",
              }}
            >
              {product.name}
            </Typography>
            <StarRating
              rating={product.rating || 4.5}
              count={product.numReviews || 0}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 1.5,
                mt: 1.5,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#6366f1", fontSize: "1.4rem" }}
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
                  sx={{ color: "#9ca3af", textDecoration: "line-through" }}
                >
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCartOutlined />}
                onClick={handleAddToCart}
                sx={{
                  bgcolor: "#6366f1",
                  borderRadius: 3,
                  px: 3,
                  fontWeight: 600,
                }}
              >
                Add to Cart
              </Button>
              <IconButton
                onClick={handleWishlist}
                sx={{ border: "1px solid #e5e7eb", borderRadius: 3 }}
              >
                <HeartOutlined />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          border: "1px solid #f3f4f6",
          transition: "all 0.4s",
          "&:hover": {
            borderColor: "#6366f1",
            boxShadow: "0 20px 40px rgba(99,102,241,0.15)",
          },
        }}
      >
        <Link to={`/product/${product._id}`}>
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <CardMedia
              component="img"
              image={
                imageError
                  ? `https://picsum.photos/seed/${imgSeed}/400/500`
                  : product.image ||
                    `https://picsum.photos/seed/${imgSeed}/400/500`
              }
              alt={product.name}
              onError={() => setImageError(true)}
              sx={{
                aspectRatio: "4/5",
                objectFit: "cover",
                transition: "transform 0.6s",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.4s",
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Chip
                    label={`-${discount}%`}
                    sx={{
                      bgcolor: "#ef4444",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      height: 24,
                    }}
                  />
                </motion.div>
              )}
              {product.isNew && (
                <Chip
                  label="NEW"
                  sx={{
                    bgcolor: "#10b981",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.65rem",
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
                transform: isHovered ? "translateX(0)" : "translateX(10px)",
                transition: "all 0.3s",
              }}
            >
              <IconButton
                onClick={handleWishlist}
                sx={{
                  bgcolor: "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <HeartOutlined />
              </IconButton>
              <IconButton
                onClick={handleAddToCart}
                sx={{ bgcolor: "#6366f1", color: "white" }}
              >
                <ShoppingCartOutlined />
              </IconButton>
            </Box>
          </Box>
        </Link>
        <CardContent
          sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              fontSize: "0.6rem",
            }}
          >
            {product.category || "Fashion"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              lineHeight: 1.4,
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              "&:hover": { color: "#6366f1" },
            }}
          >
            {product.name}
          </Typography>
          <StarRating
            rating={product.rating || 4.5}
            count={product.numReviews || 0}
          />
          <Box sx={{ mt: "auto", pt: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#6366f1", fontSize: "1.25rem" }}
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
                  variant="body2"
                  sx={{ color: "#9ca3af", textDecoration: "line-through" }}
                >
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </Typography>
              )}
            </Box>
            {product.countInStock > 0 ? (
              <Chip
                icon={
                  <CheckCircleFilled
                    style={{ color: "#10b981", fontSize: 14 }}
                  />
                }
                label={`${product.countInStock} in stock`}
                size="small"
                sx={{
                  mt: 1.5,
                  width: "100%",
                  bgcolor: "#ecfdf5",
                  color: "#059669",
                  fontWeight: 600,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              />
            ) : (
              <Chip
                label="Out of Stock"
                size="small"
                sx={{
                  mt: 1.5,
                  width: "100%",
                  bgcolor: "#fef2f2",
                  color: "#dc2626",
                  fontWeight: 600,
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

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    let mounted = true;
    const filters = {
      page: 1,
      limit: 48,
    };
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(filters);
        if (mounted) setProducts(data.products || data || []);
      } catch {
        if (mounted) setError("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const filterCategories = useMemo(() => {
    const counts = { all: products.length };
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p.category)
          counts[p.category.toLowerCase()] =
            (counts[p.category.toLowerCase()] || 0) + 1;
      });
    }
    return FILTER_CATEGORIES.map((cat) => ({
      ...cat,
      count: counts[cat.id] || 0,
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let result = [...products];
    if (selectedCategory !== "all")
      result = result.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return result;
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

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
          duration: 3500,
          style: { borderRadius: 14, background: "#1f2937", color: "#fff" },
        }}
      />
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          py: { xs: 6, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -25, 0], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.3 }}
              style={{
                position: "absolute",
                width: 250 + i * 50,
                height: 250 + i * 50,
                borderRadius: "50%",
                background: "white",
                left: `${8 + i * 15}%`,
                top: `${15 + i * 12}%`,
                filter: "blur(60px)",
              }}
            />
          ))}
        </Box>
        <Box
          sx={{
            position: "relative",
            maxWidth: 1400,
            mx: "auto",
            px: { xs: 3, md: 5 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: "white",
                fontSize: { xs: "2.2rem", md: "3.2rem" },
                mb: 1,
              }}
            >
              Shop All Products
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
            >
              Discover our curated collection of premium products
            </Typography>
          </motion.div>
        </Box>
      </Box>
      <Box
        sx={{
          maxWidth: 1600,
          mx: "auto",
          px: { xs: 2, md: 4 },
          mt: -4,
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", md: "center" },
            gap: 2,
            mb: 3,
            p: 2.5,
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
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
                flex: 1,
                maxWidth: 320,
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
              <strong>{filteredProducts.length}</strong> products
            </Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="popular">Popular</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-low">Price: Low</MenuItem>
                <MenuItem value="price-high">Price: High</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <ToggleButton
                value="grid"
                sx={{ border: "none", borderRadius: "12px !important", px: 2 }}
              >
                <AppstoreOutlined />
              </ToggleButton>
              <ToggleButton
                value="list"
                sx={{ border: "none", borderRadius: "12px !important", px: 2 }}
              >
                <UnorderedListOutlined />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Grid container spacing={3}>
          {!isMobile && (
            <Grid size={{ xs: 12, md: 3 }}>
              <Box
                sx={{
                  position: "sticky",
                  top: 100,
                  bgcolor: "white",
                  borderRadius: 4,
                  p: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FilterOutlined /> Filters
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 2, color: "#374151" }}
                >
                  Categories
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mb: 3,
                  }}
                >
                  {filterCategories.map((cat) => (
                    <Box
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor:
                          selectedCategory === cat.id
                            ? "#6366f1"
                            : "transparent",
                        color:
                          selectedCategory === cat.id ? "white" : "#6b7280",
                        transition: "all 0.2s",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <span>{cat.icon}</span>
                        <Typography variant="body2">{cat.name}</Typography>
                      </Box>
                      <Typography variant="caption">{cat.count}</Typography>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Price Range
                </Typography>
                <PriceRangeSlider
                  value={priceRange}
                  onChange={(e, v) => setPriceRange(v)}
                />
                <Divider sx={{ my: 2 }} />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ borderRadius: 3 }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          )}
          <Grid size={{ xs: 12, md: isMobile ? 12 : 9 }}>
            {loading ? (
              <Grid container spacing={3}>
                {[...Array(12)].map((_, i) => (
                  <Grid
                    key={i}
                    size={{
                      xs: 6,
                      sm: viewMode === "grid" ? 4 : 12,
                      md: viewMode === "grid" ? 3 : 12,
                    }}
                  >
                    <ProductSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 12,
                  bgcolor: "white",
                  borderRadius: 4,
                }}
              >
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 12,
                  bgcolor: "white",
                  borderRadius: 4,
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  No products found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your filters
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
                    {filteredProducts.map((product, index) => (
                      <Grid
                        key={product._id}
                        size={{
                          xs: 6,
                          sm: viewMode === "grid" ? 4 : 12,
                          md: viewMode === "grid" ? 3 : 12,
                        }}
                      >
                        <ProductCard
                          product={product}
                          index={index}
                          viewMode={viewMode}
                        />
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Box>
      <Drawer
        anchor="right"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{ sx: { width: 300, p: 3 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
          Categories
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {filterCategories.map((cat) => (
            <Chip
              key={cat.id}
              label={`${cat.icon} ${cat.name} (${cat.count})`}
              onClick={() => handleCategorySelect(cat.id)}
              color={selectedCategory === cat.id ? "primary" : "default"}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
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
          sx={{ borderRadius: 3, mb: 1.5 }}
        >
          Apply Filters
        </Button>
        <Button fullWidth variant="outlined" onClick={clearFilters}>
          Clear All
        </Button>
      </Drawer>
    </Box>
  );
};

export default Shop;
