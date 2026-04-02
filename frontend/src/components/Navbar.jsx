import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { user, logOut } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.qty || 1),
    0,
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const safeLogout = () => {
    if (typeof logOut === "function") {
      logOut();
    } else {
      console.warn("logOut function not available, using fallback");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "h-16 bg-white/95 dark:bg-gray-950/95 shadow-lg backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
            : "h-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight"
              >
                TrendyCart
              </motion.span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-10">
              {["/", "/shop", "/category", "/deals"].map((path) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `relative font-medium text-base transition-colors duration-300 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-violet-500"
                        : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    }`
                  }
                >
                  {path === "/"
                    ? "Home"
                    : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                </NavLink>
              ))}

              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `relative flex items-center gap-2 font-medium text-base transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`
                }
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.2} />
                  {cartItemCount >= 0 && (
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1.5 shadow-md ring-2 ring-white dark:ring-gray-950"
                    >
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </motion.span>
                  )}
                </div>
                <span>Cart</span>
              </NavLink>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-5 md:gap-6">
              {/* Search (placeholder) */}
              <button
                className="hidden md:block text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Auth Section */}
              <div className="hidden md:flex items-center gap-5">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition hover:opacity-90"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || "User"}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-200/40 dark:ring-indigo-800/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>
                      )}
                      <div className="hidden lg:flex flex-col items-start text-sm">
                        <span className="font-medium text-gray-900 dark:text-white leading-tight">
                          {user.name || user.email?.split("@")[0]}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role || "User"}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-4 w-64 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-800/60 overflow-hidden z-50"
                        >
                          <div className="px-5 py-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {user.name || user.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          <Link
                            to="/myorders"
                            className="flex items-center gap-3 px-5 py-3.5 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                            My Orders
                          </Link>

                          <div className="border-t dark:border-gray-800" />

                          <button
                            onClick={() => {
                              safeLogout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                          >
                            <LogOut className="w-5 h-5" strokeWidth={2} />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/login"
                      className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40"
              onClick={toggleMobileMenu}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-950 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  TrendyCart
                </span>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  {["/", "/shop", "/category", "/deals", "/cart"].map(
                    (path) => (
                      <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                          `flex items-center gap-4 py-4 px-5 rounded-2xl text-lg font-medium transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm"
                              : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                          }`
                        }
                        onClick={toggleMobileMenu}
                      >
                        {path === "/cart" ? (
                          <div className="relative">
                            <ShoppingCart className="w-6 h-6" />
                            {cartItemCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                                {cartItemCount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <ShoppingBag className="w-6 h-6" />
                        )}
                        {path === "/"
                          ? "Home"
                          : path.slice(1).charAt(0).toUpperCase() +
                            path.slice(2)}
                      </NavLink>
                    ),
                  )}
                </div>

                {user ? (
                  <div className="pt-6 border-t dark:border-gray-800 space-y-4">
                    <div className="flex items-center gap-4 px-5 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-14 h-14 rounded-full ring-2 ring-indigo-200/40"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {user.name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Welcome back
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/myorders"
                      className="flex items-center gap-4 py-4 px-5 rounded-2xl text-lg font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
                      onClick={toggleMobileMenu}
                    >
                      <ShoppingBag className="w-6 h-6" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => {
                        safeLogout();
                        toggleMobileMenu();
                      }}
                      className="w-full flex items-center gap-4 py-4 px-5 rounded-2xl text-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                    >
                      <LogOut className="w-6 h-6" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 border-t dark:border-gray-800 grid gap-4">
                    <Link
                      to="/login"
                      className="py-4 px-6 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center text-lg font-medium text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      onClick={toggleMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-center rounded-2xl hover:from-indigo-700 hover:to-violet-700 transition shadow-lg"
                      onClick={toggleMobileMenu}
                    >
                      Create Free Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
