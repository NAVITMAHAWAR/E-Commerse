import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ClockCircleOutlined,
  StarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Rate } from "antd";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";
import CountUp from "react-countup";

// Deal types
const DEAL_TYPES = {
  FLASH: {
    id: "flash",
    name: "Flash Sales",
    icon: <ThunderboltOutlined />,
    color: "#F59E0B",
    bg: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
  },
  HOT: {
    id: "hot",
    name: "Hot Deals",
    icon: <FireOutlined />,
    color: "#EF4444",
    bg: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
  },
  LIMITED: {
    id: "limited",
    name: "Limited Time",
    icon: <ClockCircleOutlined />,
    color: "#8B5CF6",
    bg: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
  },
  BEST: {
    id: "best",
    name: "Best Sellers",
    icon: <StarOutlined />,
    color: "#10B981",
    bg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  },
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Mins" },
        { value: timeLeft.seconds, label: "Secs" },
      ].map((item, index) => (
        <Box key={index} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              minWidth: 45,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#EF4444", lineHeight: 1 }}
            >
              {String(item.value).padStart(2, "0")}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "white", fontSize: "0.6rem", fontWeight: 600 }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Animated Counter
const AnimatedCounter = ({ value, suffix = "" }) => (
  <CountUp end={value} duration={2} separator="," suffix={suffix} />
);

// Flash Deal Card
const FlashDealCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imgSeed] = useState(() => Math.floor(Math.random() * 10000));

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const stockPercentage = Math.min((product.countInStock / 50) * 100, 100);

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-xl">🛒</span>
        <span>{product.name?.slice(0, 25)} added!</span>
      </div>,
      { duration: 2500, iconTheme: { primary: "#F59E0B", secondary: "#fff" } },
    );
  };

  // Random end time for demo (24 hours from now)
  const endTime = useMemo(() => {
    const date = new Date();
    date.setHours(date.getHours() + 24);
    return date;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 12,
      }}
    >
      <Card
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "visible",
          transition: "all 0.4s",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 40px rgba(245, 158, 11, 0.25)",
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Deal Badge */}
        <Box sx={{ position: "absolute", top: -12, left: 16, zIndex: 10 }}>
          <Chip
            icon={<ThunderboltOutlined style={{ color: "white" }} />}
            label="FLASH SALE"
            sx={{
              bgcolor: "#F59E0B",
              color: "white",
              fontWeight: 800,
              fontSize: "0.7rem",
              height: 28,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
            }}
          />
        </Box>

        {/* Countdown */}
        <Box
          sx={{
            bgcolor: "#FEF3C7",
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <ClockCircleOutlined style={{ color: "#F59E0B" }} />
          <CountdownTimer targetDate={endTime} />
        </Box>

        <Link to={`/product/${product._id}`}>
          <Box sx={{ position: "relative", overflow: "hidden" }}>
            <CardMedia
              component="img"
              image={
                product.image || `https://picsum.photos/seed/${imgSeed}/400/500`
              }
              alt={product.name}
              sx={{
                aspectRatio: "1",
                objectFit: "cover",
                transition: "transform 0.6s",
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
            />
            <Box sx={{ position: "absolute", top: 8, right: 8 }}>
              {discount > 0 && (
                <Chip
                  label={`-${discount}%`}
                  size="small"
                  sx={{
                    bgcolor: "#EF4444",
                    color: "white",
                    fontWeight: "bold",
                    height: 24,
                  }}
                />
              )}
            </Box>
          </Box>
        </Link>

        <CardContent sx={{ p: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#6B7280",
              textTransform: "uppercase",
              fontSize: "0.65rem",
              fontWeight: 600,
            }}
          >
            {product.category || "Deal"}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Rate
              disabled
              defaultValue={product.rating || 4.5}
              style={{ fontSize: 12 }}
            />
            <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
              ({product.numReviews || 0})
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#F59E0B", fontSize: "1.3rem" }}
            >
              ₹<AnimatedCounter value={product.price} />
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="body2"
                sx={{ color: "#9CA3AF", textDecoration: "line-through" }}
              >
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </Typography>
            )}
          </Box>

          {/* Stock Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#EF4444", fontWeight: 600 }}
              >
                {product.countInStock} left!
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                {Math.round(stockPercentage)}% sold
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stockPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "#FEE2E2",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#EF4444",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleAddToCart}
            startIcon={<ShoppingCartOutlined />}
            sx={{
              bgcolor: "#F59E0B",
              color: "white",
              fontWeight: 700,
              borderRadius: 3,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              "&:hover": { bgcolor: "#D97706" },
            }}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Hot Deal Card
const HotDealCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imgSeed] = useState(() => Math.floor(Math.random() * 10000));

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        sx={{
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          transition: "all 0.3s",
          "&:hover": { boxShadow: "0 12px 24px rgba(239, 68, 68, 0.15)" },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={{ position: "relative", width: 140, flexShrink: 0 }}>
          <CardMedia
            component="img"
            image={
              product.image || `https://picsum.photos/seed/${imgSeed}/200/200`
            }
            alt={product.name}
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
                bgcolor: "#EF4444",
                color: "white",
                fontWeight: "bold",
                height: 22,
              }}
            />
          )}
        </Box>
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#6B7280",
              textTransform: "uppercase",
              fontSize: "0.6rem",
            }}
          >
            {product.category || "Hot Deal"}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.5 }}
          >
            {product.name?.slice(0, 40)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Rate
              disabled
              defaultValue={product.rating || 4}
              style={{ fontSize: 10 }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "#EF4444", fontSize: "1.1rem" }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </Typography>
            {product.originalPrice && (
              <Typography
                variant="caption"
                sx={{ color: "#9CA3AF", textDecoration: "line-through" }}
              >
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            onClick={() => {
              addToCart(product, 1);
              toast.success("Added to cart!");
            }}
            sx={{
              mt: 1,
              borderRadius: 2,
              bgcolor: "#FEE2E2",
              color: "#EF4444",
              "&:hover": { bgcolor: "#FECACA" },
            }}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Deals Page
const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("flash");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
    const data = await getProducts();
    if (mounted) {
      if (data && data.products) {
        setProducts(data.products);
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    }
      } catch (err) {
        console.error("Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  // Get products with discounts for deals
  const dealProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products
      .filter((p) => p.originalPrice && p.originalPrice > p.price)
      .sort((a, b) => {
        const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
        const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
        return discountB - discountA;
      });
  }, [products]);

  const hotDeals = dealProducts.slice(0, 5);
  const flashDeals = dealProducts.slice(0, 8);

  const tabs = [
    { ...DEAL_TYPES.FLASH, count: flashDeals.length },
    { ...DEAL_TYPES.HOT, count: hotDeals.length },
    { ...DEAL_TYPES.LIMITED, count: dealProducts.length },
    { ...DEAL_TYPES.BEST, count: products.length },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0F172A", pb: 8 }}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#1F2937", color: "#fff" },
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)",
          py: { xs: 8, md: 14 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background */}
        <Box sx={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 8 + i, repeat: Infinity, delay: i * 0.5 }}
              style={{
                position: "absolute",
                width: 100 + i * 30,
                height: 100 + i * 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
                left: `${5 + i * 12}%`,
                top: `${10 + i * 10}%`,
                filter: "blur(40px)",
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            position: "relative",
            maxWidth: 1200,
            mx: "auto",
            px: 4,
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ThunderboltOutlined style={{ fontSize: 48, color: "white" }} />
              </motion.div>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: "white",
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                FLASH DEALS
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500, mb: 4 }}
            >
              Up to{" "}
              <span style={{ color: "#FEF08A", fontWeight: 800 }}>70% OFF</span>{" "}
              - Limited Time Only!
            </Typography>

            {/* Main Countdown */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CountdownTimer
                targetDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
              />
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{ bgcolor: "#1E293B", py: 3, borderBottom: "1px solid #334155" }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: 4,
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {[
            {
              label: "Flash Deals",
              value: flashDeals.length,
              icon: <ThunderboltOutlined />,
            },
            {
              label: "Hot Sales",
              value: hotDeals.length,
              icon: <FireOutlined />,
            },
            {
              label: "Products",
              value: products.length,
              icon: <StarOutlined />,
            },
            {
              label: "Saved",
              value: `₹${dealProducts.reduce((acc, p) => acc + (p.originalPrice - p.price) * 5, 0).toLocaleString("en-IN")}`,
              icon: <ClockCircleOutlined />,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center" }}
            >
              <Box sx={{ color: "#F59E0B", mb: 0.5 }}>{stat.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "white" }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                {stat.label}
              </Typography>
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 2,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {tabs.map((tab) => (
            <motion.div
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setActiveTab(tab.id)}
                startIcon={tab.icon}
                sx={{
                  bgcolor: activeTab === tab.id ? tab.color : "transparent",
                  color: activeTab === tab.id ? "white" : "#94A3B8",
                  border: `2px solid ${activeTab === tab.id ? tab.color : "#334155"}`,
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: activeTab === tab.id ? tab.color : "#1E293B",
                  },
                }}
              >
                {tab.name}
                <Chip
                  label={tab.count}
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor: "white",
                    color: tab.color,
                    height: 20,
                    fontSize: "0.7rem",
                  }}
                />
              </Button>
            </motion.div>
          ))}
        </Box>

        {/* Deals Content */}
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography sx={{ color: "white" }}>Loading deals...</Typography>
            </Box>
          ) : activeTab === "flash" ? (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <ThunderboltOutlined
                    style={{ color: "#F59E0B", fontSize: 28 }}
                  />
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, color: "white" }}
                  >
                    Flash Sales
                  </Typography>
                </Box>
                <Button
                  endIcon={<RightOutlined />}
                  sx={{ color: "#F59E0B", fontWeight: 600 }}
                >
                  View All
                </Button>
              </Box>
              <Grid container spacing={3}>
                {flashDeals.map((product, index) => (
                  <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <FlashDealCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : activeTab === "hot" ? (
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <FireOutlined style={{ color: "#EF4444", fontSize: 28 }} />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "white" }}
                >
                  Hot Deals
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {hotDeals.map((product, index) => (
                  <HotDealCard
                    key={product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </Box>
            </Box>
          ) : activeTab === "limited" ? (
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "white", mb: 3 }}
              >
                Limited Time Offers
              </Typography>
              <Grid container spacing={3}>
                {dealProducts.slice(0, 8).map((product, index) => (
                  <Grid key={product._id} size={{ xs: 6, md: 3 }}>
                    <FlashDealCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "white", mb: 3 }}
              >
                Best Sellers
              </Typography>
              <Grid container spacing={3}>
                {products.slice(0, 8).map((product, index) => (
                  <Grid key={product._id} size={{ xs: 6, md: 3 }}>
                    <FlashDealCard product={product} index={index} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Deals;
