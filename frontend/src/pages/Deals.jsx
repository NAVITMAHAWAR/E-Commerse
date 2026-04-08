import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";

/* ── Font Injection ────────────────────────────────────── */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Fraunces:ital,wght@0,300;0,700;0,900;1,300;1,700&display=swap');
    .deals-root { font-family: 'Cabinet Grotesk', sans-serif; }
    .font-display { font-family: 'Fraunces', serif; }
    @keyframes tick { from{transform:translateY(0)} 50%{transform:translateY(-2px)} to{transform:translateY(0)} }
    @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 70%{box-shadow:0 0 0 12px rgba(239,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
    @keyframes shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
    @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-18px) rotate(3deg)} 66%{transform:translateY(-8px) rotate(-2deg)} }
    @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes scanline { 0%{top:-10%} 100%{top:110%} }
    .skel { background:linear-gradient(90deg,#1e1e2e 0%,#2a2a3e 50%,#1e1e2e 100%); background-size:200% 100%; animation:shimmer 1.6s infinite; }
    .ticker-inner { display:flex; white-space:nowrap; animation:marquee 22s linear infinite; }
    .sec-num { font-family:'Fraunces',serif; font-size:5rem; font-weight:900; line-height:1; opacity:0.06; position:absolute; top:-1rem; left:-1rem; color:white; pointer-events:none; }
  `}</style>
);

/* ── Countdown Timer ───────────────────────────────────── */
const useCountdown = (target) => {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target) - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
};

const TimerBox = ({ val, label, accent = "text-red-400" }) => (
  <div className="flex flex-col items-center">
    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded px-3 py-2 min-w-[52px] text-center overflow-hidden">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
      <span
        className="font-display text-2xl font-black text-white tracking-tight"
        style={{ animation: "tick 1s ease infinite" }}
      >
        {String(val).padStart(2, "0")}
      </span>
    </div>
    <span className="text-[9px] tracking-widest uppercase mt-1.5 text-white/50 font-medium">
      {label}
    </span>
  </div>
);

const Countdown = ({ target, size = "md" }) => {
  const t = useCountdown(target);
  return (
    <div className="flex items-end gap-2">
      {[
        { v: t.d, l: "Days" },
        { v: t.h, l: "Hrs" },
        { v: t.m, l: "Min" },
        { v: t.s, l: "Sec" },
      ].map((x, i) => (
        <React.Fragment key={x.l}>
          <TimerBox val={x.v} label={x.l} />
          {i < 3 && (
            <span className="text-white/40 text-lg font-black mb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Utilities ─────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const pct = (p, o) => (o ? Math.round(((o - p) / o) * 100) : 0);
const img = (src, seed) => src || `https://picsum.photos/seed/${seed}/500/600`;

/* ── Progress Bar ──────────────────────────────────────── */
const StockBar = ({ stock = 0, total = 50 }) => {
  const pctSold = Math.min(100, Math.round(((total - stock) / total) * 100));
  const color =
    pctSold > 80
      ? "bg-red-500"
      : pctSold > 50
        ? "bg-amber-400"
        : "bg-emerald-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
          {stock > 0 ? `${stock} left` : "Sold out"}
        </span>
        <span className="text-[10px] text-white/40">{pctSold}% sold</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pctSold}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

/* ── Flash Deal Card ───────────────────────────────────── */
const FlashCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [seed] = useState(() => Math.floor(Math.random() * 9999));
  const [hovered, setHovered] = useState(false);
  const d = pct(product.price, product.originalPrice);
  const endTime = useMemo(
    () => new Date(Date.now() + (18 + index * 2) * 3600000),
    [index],
  );
  const t = useCountdown(endTime);

  const onCart = () => {
    addToCart(product, 1);
    toast.success("Added to cart! 🛒", {
      style: {
        background: "#1a1a2e",
        color: "#f8f8f0",
        border: "1px solid rgba(251,191,36,0.3)",
        fontFamily: "Cabinet Grotesk, sans-serif",
        fontSize: "13px",
      },
    });
  };

  return (
    <motion.div
      className="group relative bg-[#111827] border border-white/[0.07] overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        type: "spring",
        stiffness: 80,
        damping: 16,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Scanline effect on hover */}
      {hovered && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          <div
            className="absolute w-full h-8 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent"
            style={{ animation: "scanline 1.5s linear infinite" }}
          />
        </div>
      )}

      {/* Timer bar */}
      <div className="bg-gradient-to-r from-red-950/80 to-orange-950/80 border-b border-white/[0.06] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-red-400 text-xs">⚡</span>
          <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-red-400/80">
            Ends in
          </span>
        </div>
        <div className="flex items-center gap-1 text-white font-bold text-xs">
          <span className="bg-white/10 px-1.5 py-0.5 rounded">
            {String(t.h).padStart(2, "0")}
          </span>
          <span className="text-white/40">:</span>
          <span className="bg-white/10 px-1.5 py-0.5 rounded">
            {String(t.m).padStart(2, "0")}
          </span>
          <span className="text-white/40">:</span>
          <span
            className="bg-white/10 px-1.5 py-0.5 rounded"
            style={{ color: "#f87171", animation: "tick 1s ease infinite" }}
          >
            {String(t.s).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <Link to={`/product/${product._id}`}>
          <img
            src={img(product.image, seed)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
            loading="lazy"
            onError={(e) => (e.target.src = img(null, seed))}
          />
        </Link>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />

        {/* Badges */}
        {d > 0 && (
          <div className="absolute top-3 left-3">
            <div className="bg-red-500 text-white text-[10px] font-black tracking-wider px-2 py-0.5 uppercase">
              -{d}%
            </div>
          </div>
        )}

        {/* Wishlist */}
        <button
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 hover:border-red-400/40 transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            toast("Added to wishlist ♡", {
              style: {
                background: "#1a1a2e",
                color: "#f8f8f0",
                border: "1px solid rgba(239,68,68,0.3)",
                fontFamily: "Cabinet Grotesk,sans-serif",
                fontSize: "13px",
              },
            });
          }}
        >
          ♡
        </button>

        {/* Flash tag */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm px-2 py-0.5">
          <span className="text-[9px] font-black text-black tracking-widest uppercase">
            Flash
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-3.5 gap-2.5">
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">
            {product.category || "Deal"}
          </div>
          <Link to={`/product/${product._id}`}>
            <h3 className="text-sm font-semibold text-white/90 leading-tight line-clamp-2 hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-[11px] ${i <= Math.round(product.rating || 4) ? "text-amber-400" : "text-white/15"}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-[10px] text-white/30">
            ({product.numReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-amber-400">
            ₹{fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-white/30 line-through">
              ₹{fmt(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock bar */}
        <StockBar stock={product.countInStock || 8} />

        {/* CTA */}
        <button
          onClick={onCart}
          className="mt-auto w-full bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black tracking-widest uppercase py-2.5 transition-all duration-200 active:scale-98"
        >
          Add to Cart →
        </button>
      </div>
    </motion.div>
  );
};

/* ── Hot Deal Row Card ─────────────────────────────────── */
const HotRow = ({ product, index }) => {
  const { addToCart } = useCart();
  const [seed] = useState(() => Math.floor(Math.random() * 9999));
  const d = pct(product.price, product.originalPrice);

  return (
    <motion.div
      className="group flex bg-[#111827] border border-white/[0.07] overflow-hidden hover:border-red-500/20 transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {/* Image */}
      <div className="relative w-28 shrink-0 overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={img(product.image, seed)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => (e.target.src = img(null, seed))}
          />
        </Link>
        {d > 0 && (
          <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5">
            -{d}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-0.5">
            {product.category || "Hot"}
          </div>
          <Link to={`/product/${product._id}`}>
            <h4 className="text-sm font-semibold text-white/90 line-clamp-1 hover:text-red-400 transition-colors">
              {product.name}
            </h4>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-[10px] ${i <= Math.round(product.rating || 4) ? "text-amber-400" : "text-white/15"}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-red-400">
              ₹{fmt(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-white/25 line-through">
                ₹{fmt(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              addToCart(product, 1);
              toast.success("Added! 🛒", {
                style: {
                  background: "#1a1a2e",
                  color: "#f8f8f0",
                  border: "1px solid rgba(239,68,68,0.3)",
                  fontFamily: "Cabinet Grotesk,sans-serif",
                  fontSize: "13px",
                },
              });
            }}
            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 border border-red-500/20 hover:border-red-500 transition-all duration-200"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Best Seller Card ──────────────────────────────────── */
const BestCard = ({ product, index, rank }) => {
  const { addToCart } = useCart();
  const [seed] = useState(() => Math.floor(Math.random() * 9999));
  const d = pct(product.price, product.originalPrice);

  return (
    <motion.div
      className="group relative bg-[#111827] border border-white/[0.07] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {/* Rank badge */}
      <div className="absolute top-2 left-2 z-10">
        <div
          className={`w-7 h-7 flex items-center justify-center text-xs font-black ${rank <= 3 ? "bg-amber-400 text-black" : "bg-white/10 text-white/60"}`}
        >
          #{rank}
        </div>
      </div>

      <div className="relative overflow-hidden aspect-[3/4]">
        <Link to={`/product/${product._id}`}>
          <img
            src={img(product.image, seed)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-107"
            style={{ transform: "scale(1)" }}
            loading="lazy"
            onError={(e) => (e.target.src = img(null, seed))}
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />
        {d > 0 && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 uppercase">
            -{d}%
          </div>
        )}
        {/* Hover actions */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 bg-white/10 backdrop-blur-sm text-white text-[9px] font-bold tracking-widest uppercase py-2.5 text-center hover:bg-white/20 transition-colors border-r border-white/10"
          >
            View
          </Link>
          <button
            onClick={() => {
              addToCart(product, 1);
              toast.success("Added! 🛒", {
                style: {
                  background: "#1a1a2e",
                  color: "#f8f8f0",
                  border: "1px solid rgba(16,185,129,0.3)",
                  fontFamily: "Cabinet Grotesk,sans-serif",
                  fontSize: "13px",
                },
              });
            }}
            className="flex-1 bg-emerald-500 text-white text-[9px] font-bold tracking-widest uppercase py-2.5 text-center hover:bg-emerald-400 transition-colors"
          >
            Cart
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">
          {product.category || "Trending"}
        </div>
        <Link to={`/product/${product._id}`}>
          <h4 className="text-xs font-semibold text-white/90 line-clamp-2 leading-tight hover:text-emerald-400 transition-colors">
            {product.name}
          </h4>
        </Link>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-display text-base font-bold text-emerald-400">
            ₹{fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-white/25 line-through">
              ₹{fmt(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Limited Deal Card ─────────────────────────────────── */
const LimitedCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const [seed] = useState(() => Math.floor(Math.random() * 9999));
  const d = pct(product.price, product.originalPrice);
  const endTime = useMemo(
    () => new Date(Date.now() + (6 + index) * 3600000),
    [index],
  );

  return (
    <motion.div
      className="group flex flex-col bg-[#111827] border border-white/[0.07] overflow-hidden hover:border-violet-500/20 transition-all"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="relative overflow-hidden aspect-square">
        <Link to={`/product/${product._id}`}>
          <img
            src={img(product.image, seed)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-600"
            style={{ transform: "scale(1)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            loading="lazy"
            onError={(e) => (e.target.src = img(null, seed))}
          />
        </Link>
        {d > 0 && (
          <div className="absolute top-2 left-2 bg-violet-500 text-white text-[9px] font-black px-1.5 py-0.5">
            -{d}%
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Countdown overlay */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1.5 flex items-center justify-between">
          <span className="text-[9px] text-violet-300 font-bold tracking-wider uppercase">
            ⏳ Limited
          </span>
          <LimitedTimer target={endTime} />
        </div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">
          {product.category || "Limited"}
        </div>
        <Link to={`/product/${product._id}`}>
          <h4 className="text-xs font-semibold text-white/90 line-clamp-2 hover:text-violet-400 transition-colors">
            {product.name}
          </h4>
        </Link>
        <div className="flex items-baseline gap-1.5 mt-2 mb-3">
          <span className="font-display text-base font-bold text-violet-400">
            ₹{fmt(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-white/25 line-through">
              ₹{fmt(product.originalPrice)}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            addToCart(product, 1);
            toast.success("Added! 🛒", {
              style: {
                background: "#1a1a2e",
                color: "#f8f8f0",
                border: "1px solid rgba(139,92,246,0.3)",
                fontFamily: "Cabinet Grotesk,sans-serif",
                fontSize: "13px",
              },
            });
          }}
          className="mt-auto w-full bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white text-[10px] font-bold tracking-widest uppercase py-2 border border-violet-500/20 hover:border-violet-500 transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

const LimitedTimer = ({ target }) => {
  const t = useCountdown(target);
  return (
    <span className="text-[10px] font-black text-white tabular-nums">
      {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:
      {String(t.s).padStart(2, "0")}
    </span>
  );
};

/* ── Tab Config ────────────────────────────────────────── */
const TABS = [
  {
    id: "flash",
    label: "Flash Sales",
    emoji: "⚡",
    accent: "text-amber-400",
    border: "border-amber-400",
    bg: "bg-amber-400",
    dark: "bg-amber-400/10",
  },
  {
    id: "hot",
    label: "Hot Deals",
    emoji: "🔥",
    accent: "text-red-400",
    border: "border-red-400",
    bg: "bg-red-500",
    dark: "bg-red-500/10",
  },
  {
    id: "limited",
    label: "Limited Time",
    emoji: "⏳",
    accent: "text-violet-400",
    border: "border-violet-400",
    bg: "bg-violet-500",
    dark: "bg-violet-500/10",
  },
  {
    id: "best",
    label: "Best Sellers",
    emoji: "🏆",
    accent: "text-emerald-400",
    border: "border-emerald-400",
    bg: "bg-emerald-500",
    dark: "bg-emerald-500/10",
  },
];

/* ── Section Header ────────────────────────────────────── */
const SectionHead = ({ emoji, title, subtitle, accent, num }) => (
  <div className="relative flex items-end justify-between mb-8">
    <div className="sec-num">{num}</div>
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{emoji}</span>
        <span
          className={`text-[10px] tracking-[0.3em] uppercase font-bold ${accent}`}
        >
          {subtitle}
        </span>
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-none tracking-tight">
        {title}
      </h2>
    </div>
    <Link
      to="/shop"
      className={`text-[10px] tracking-[0.2em] uppercase font-bold border-b border-white/10 hover:border-white/40 text-white/40 hover:text-white/80 transition-all pb-0.5`}
    >
      View All →
    </Link>
  </div>
);

/* ── Skeleton ──────────────────────────────────────────── */
const CardSkel = () => (
  <div className="bg-[#111827] border border-white/[0.07]">
    <div className="skel aspect-square" />
    <div className="p-3.5 space-y-2.5">
      <div className="skel h-3 w-2/3 rounded" />
      <div className="skel h-3 rounded" />
      <div className="skel h-5 w-1/3 rounded" />
      <div className="skel h-8 rounded" />
    </div>
  </div>
);

/* ── Main Deals Component ──────────────────────────────── */
const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("flash");
  const heroEnd = useMemo(() => new Date(Date.now() + 24 * 3600000), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getProducts();
        if (alive)
          setProducts(
            Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data)
                ? data
                : [],
          );
      } catch {
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const dealProds = useMemo(
    () =>
      products
        .filter((p) => p.originalPrice && p.originalPrice > p.price)
        .sort(
          (a, b) =>
            pct(b.price, b.originalPrice) - pct(a.price, a.originalPrice),
        ),
    [products],
  );

  const flashDeals = dealProds.slice(0, 8);
  const hotDeals = dealProds.slice(0, 6);
  const limitedDels = dealProds.slice(0, 8);
  const bestSellers = products.slice(0, 8);
  const curTab = TABS.find((t) => t.id === tab);

  return (
    <div className="deals-root min-h-screen bg-[#080810] text-white">
      <Fonts />
      <Toaster position="top-right" />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated blobs */}
        {[
          {
            c: "from-amber-500/20 to-red-500/20",
            s: 700,
            x: "10%",
            y: "5%",
            d: 8,
          },
          {
            c: "from-violet-500/15 to-purple-500/10",
            s: 500,
            x: "60%",
            y: "30%",
            d: 11,
          },
          {
            c: "from-red-500/10 to-rose-500/10",
            s: 400,
            x: "30%",
            y: "60%",
            d: 9,
          },
        ].map((b, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br ${b.c} blur-[120px] pointer-events-none`}
            style={{
              width: b.s,
              height: b.s,
              left: b.x,
              top: b.y,
              animation: `float ${b.d}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 mb-6"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-red-400"
                  style={{ animation: "pulse-ring 1.5s ease infinite" }}
                />
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-amber-400">
                  Live Flash Event
                </span>
              </motion.div>

              <h1 className="font-display text-6xl md:text-8xl font-black leading-none tracking-tighter mb-4">
                <span className="text-white">MEGA</span>
                <br />
                <span className="text-amber-400 italic">DEALS</span>
                <br />
                <span className="text-white/30 text-4xl md:text-5xl not-italic">
                  UP TO 70% OFF
                </span>
              </h1>

              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-md tracking-wide">
                Handpicked flash sales, limited-time offers, and the hottest
                deals — all in one place. Don't blink, these won't last.
              </p>

              {/* Hero Countdown */}
              <div className="mb-8">
                <div className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-3 font-bold">
                  Sale Ends In
                </div>
                <Countdown target={heroEnd} />
              </div>

              {/* CTA buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setTab("flash")}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] tracking-widest uppercase px-6 py-3.5 transition-all active:scale-95"
                >
                  ⚡ Flash Sales
                </button>
                <button
                  onClick={() => setTab("hot")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-[11px] tracking-widest uppercase px-6 py-3.5 transition-all"
                >
                  🔥 Hot Deals
                </button>
              </div>
            </motion.div>

            {/* Right — collage */}
            <motion.div
              className="hidden lg:grid grid-cols-2 gap-2 h-[520px]"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                {
                  img: "https://loremflickr.com/500/600/fashion,woman,model?random=401",
                  span: "row-span-2",
                },
                {
                  img: "https://loremflickr.com/500/300/fashion,accessories?random=402",
                },
                {
                  img: "https://loremflickr.com/500/300/shoes,sneakers?random=403",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden ${item.span || ""}`}
                >
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────── */}
      <motion.div
        className="border-y border-white/[0.06] bg-[#0d0d1a]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
          {[
            {
              num: flashDeals.length,
              label: "Flash Deals",
              emoji: "⚡",
              color: "text-amber-400",
            },
            {
              num: hotDeals.length,
              label: "Hot Deals",
              emoji: "🔥",
              color: "text-red-400",
            },
            {
              num: products.length,
              label: "Products",
              emoji: "◈",
              color: "text-violet-400",
            },
            {
              num: `${dealProds.length}+`,
              label: "On Sale",
              emoji: "✦",
              color: "text-emerald-400",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="px-6 py-5 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-lg mb-1">{s.emoji}</div>
              <div className={`font-display text-2xl font-black ${s.color}`}>
                {s.num}
              </div>
              <div className="text-[9px] tracking-[0.2em] uppercase text-white/30 mt-0.5">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── MARQUEE ──────────────────────────────── */}
      <div className="overflow-hidden border-b border-white/[0.04] py-3 bg-[#0a0a15]">
        <div className="ticker-inner">
          {[...Array(3)].flatMap((_, k) =>
            [
              "⚡ Flash Sale",
              "🔥 70% Off",
              "⏳ Limited Stock",
              "🏆 Best Sellers",
              "✦ Free Shipping ₹500+",
              "💎 Premium Deals",
            ].map((t, i) => (
              <span
                key={`${k}-${i}`}
                className="text-[10px] tracking-[0.25em] uppercase text-white/20 px-8 font-bold"
              >
                {t}
              </span>
            )),
          )}
        </div>
      </div>

      {/* ── TAB NAV ──────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#080810]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[11px] tracking-[0.15em] uppercase font-bold whitespace-nowrap border-b-2 transition-all ${
                  tab === t.id
                    ? `${t.border} ${t.accent}`
                    : "border-transparent text-white/30 hover:text-white/60"
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <AnimatePresence mode="wait">
          {/* ── FLASH TAB ── */}
          {tab === "flash" && (
            <motion.div
              key="flash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionHead
                emoji="⚡"
                title="Flash Sales"
                subtitle="Ends soon — grab fast"
                accent="text-amber-400"
                num="01"
              />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {[...Array(8)].map((_, i) => (
                    <CardSkel key={i} />
                  ))}
                </div>
              ) : flashDeals.length === 0 ? (
                <Empty msg="No flash deals right now. Check back soon!" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {flashDeals.map((p, i) => (
                    <FlashCard key={p._id} product={p} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── HOT TAB ── */}
          {tab === "hot" && (
            <motion.div
              key="hot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionHead
                emoji="🔥"
                title="Hot Deals"
                subtitle="Trending right now"
                accent="text-red-400"
                num="02"
              />
              <div className="grid md:grid-cols-2 gap-px bg-white/[0.04] border border-white/[0.04]">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="skel h-36 bg-[#111827]" />
                  ))
                ) : hotDeals.length === 0 ? (
                  <Empty msg="No hot deals right now." />
                ) : (
                  hotDeals.map((p, i) => (
                    <HotRow key={p._id} product={p} index={i} />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── LIMITED TAB ── */}
          {tab === "limited" && (
            <motion.div
              key="limited"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionHead
                emoji="⏳"
                title="Limited Time"
                subtitle="Running out fast"
                accent="text-violet-400"
                num="03"
              />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {[...Array(8)].map((_, i) => (
                    <CardSkel key={i} />
                  ))}
                </div>
              ) : limitedDels.length === 0 ? (
                <Empty msg="No limited offers right now." />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {limitedDels.map((p, i) => (
                    <LimitedCard key={p._id} product={p} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── BEST TAB ── */}
          {tab === "best" && (
            <motion.div
              key="best"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <SectionHead
                emoji="🏆"
                title="Best Sellers"
                subtitle="Customer favourites"
                accent="text-emerald-400"
                num="04"
              />
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {[...Array(8)].map((_, i) => (
                    <CardSkel key={i} />
                  ))}
                </div>
              ) : bestSellers.length === 0 ? (
                <Empty msg="No products yet." />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.04] border border-white/[0.04]">
                  {bestSellers.map((p, i) => (
                    <BestCard key={p._id} product={p} index={i} rank={i + 1} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BOTTOM CTA BANNER ────────────────────── */}
      <section className="border-t border-white/[0.06] bg-[#0d0d1a]">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-amber-400/70 mb-2 font-bold">
              Never Miss a Deal
            </div>
            <h3 className="font-display text-3xl font-black text-white leading-tight">
              Get <em className="text-amber-400">exclusive</em> alerts
              <br />
              before they go live.
            </h3>
          </div>
          <div className="flex w-full md:w-auto max-w-md">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-amber-400/40 transition-colors min-w-0"
            />
            <button className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] tracking-widest uppercase px-5 py-3 whitespace-nowrap transition-colors">
              Notify Me →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const Empty = ({ msg }) => (
  <div className="border border-white/[0.06] bg-[#0d0d1a] py-20 text-center">
    <div className="text-4xl mb-4 opacity-20">◎</div>
    <p className="text-sm text-white/30 tracking-wide">{msg}</p>
  </div>
);

export default Deals;
