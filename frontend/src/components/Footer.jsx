import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t-2 border-indigo-500/30">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-bold text-white">E</span>
              </div>
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  E-Commerce
                </h3>
                <p className="text-gray-400">Premium Shopping Experience</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h4 className="text-white font-bold mb-4">Stay Updated</h4>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 backdrop-blur-sm"
                />
                <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl">
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white font-bold text-xl mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                  Cart
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Care */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-white font-bold text-xl mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/myorders"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  My Orders
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Track Order
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Returns
                </a>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-300 hover:text-white transition-colors group"
                >
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>{" "}
                  Help Center
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-white font-bold text-xl mb-6">
              Connect With Us
            </h4>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <span className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  📞
                </span>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <span className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  ✉️
                </span>
                <span>support@ecommerce.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-205e-5-.833-.815-1.666-.984-.352.62-.556 1.348-.556 2.125 0 1.64 0.884 3.082 2.224 3.919-.825.228-1.596.621-2.321.937.407 1.249 1.587 2.164 2.985 2.197-1.372.955-3.1 1.523-4.973 1.523-.645 0-1.276-.038-1.897-.113 1.68.538 3.679.854 5.666 0.854 6.805 0 10.525-5.637 10.525-12.524 0-.191-.004-.383-.011-.572.908-.657 1.693-1.482 2.316-2.423z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-.14-.01-2.02-.15.38.72.72 1.53 1.32 2.48.43.33.94.58 1.47.75-.54.37-.99.95-1.3 1.73.43.13.92.2 1.41.2.75 0 1.44-.08 2.11-.18 1.28-.66 2.33-1.52 3.19-3.13.17.31.48.91.84 1.12.59.29 1.22.47 1.88.47 2.26 0 3.5-1.88 3.5-4.42 0-.7-.14-1.36-.38-1.98.26-.07.5-.2.72-.39z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8 8s8 3.59 8 8-3.59 8-8-8zM12 6c-2.76 0-5 2.76-5 5s2.76 5 5 5s5-2.76 5-5S14.76 6 12 6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4 4s4 1.79 4 4-1.79 4-4 4z" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
          <div>© 2024 E-Commerce. All rights reserved. Made with ❤️</div>

          {/* Payment Methods */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg" />
              <div className="w-16 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg" />
              <div className="w-14 h-8 bg-green-500 rounded-lg shadow-lg" />
              <div className="w-12 h-8 bg-orange-500 rounded-lg shadow-lg" />
            </div>
            <span>Secure Payments</span>
          </div>

          <div className="flex gap-1 text-xs">
            <Link to="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>|</span>
            <Link to="#" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
