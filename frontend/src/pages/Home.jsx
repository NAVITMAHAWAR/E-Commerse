import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { getProducts } from "../api/productApi";
import { useCart } from "../context/CartContext";
import toast, { Toaster } from "react-hot-toast";

// ── Font + Global Styles ──────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

    :root {
      --c-bg: #080810;
      --c-surface: #0f0f1a;
      --c-card: #13131f;
      --c-border: rgba(255,255,255,0.07);
      --c-gold: #d4a853;
      --c-gold-lt: #f0c97a;
      --c-accent: #7c6af7;
      --c-accent2: #e85d9c;
      --c-text: #f0ede8;
      --c-muted: #7a7891;
      --font-display: 'Playfair Display', serif;
      --font-body: 'Outfit', sans-serif;
    }

    .h-root { background: var(--c-bg); color: var(--c-text); font-family: var(--font-body); overflow-x: hidden; }
    .h-root * { box-sizing: border-box; }

    /* Scrollbar */
    .h-root ::-webkit-scrollbar { width: 4px; }
    .h-root ::-webkit-scrollbar-track { background: var(--c-bg); }
    .h-root ::-webkit-scrollbar-thumb { background: var(--c-gold); border-radius: 4px; }

    /* ── TICKER ─────────────────────────────────────── */
    .ticker-wrap { background: var(--c-gold); overflow: hidden; height: 36px; display: flex; align-items: center; }
    .ticker-inner { display: flex; gap: 0; white-space: nowrap; animation: ticker 30s linear infinite; }
    .ticker-item { font-family: var(--font-body); font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #0a0a14; padding: 0 2.5rem; }
    @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }

    /* ── HERO SLIDER ────────────────────────────────── */
    .hero-slide { position: absolute; inset: 0; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; transform-origin: center; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(8,8,16,0.85) 35%, rgba(8,8,16,0.3) 100%); }
    .slide-counter { position: absolute; right: 2.5rem; bottom: 2.5rem; font-size: 11px; letter-spacing: 0.2em; color: rgba(240,237,232,0.5); font-family: var(--font-body); }
    .slide-dots { position: absolute; left: 50%; bottom: 2rem; transform: translateX(-50%); display: flex; gap: 8px; }
    .slide-dot { width: 28px; height: 2px; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.4s; }
    .slide-dot.active { background: var(--c-gold); width: 52px; }
    .hero-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.4); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; color: white; }
    .hero-nav:hover { border-color: var(--c-gold); color: var(--c-gold); }
    .hero-nav-l { left: 1.5rem; }
    .hero-nav-r { right: 1.5rem; }

    /* ── SECTION STYLES ─────────────────────────────── */
    .section { padding: 5rem 0; }
    .container { max-width: 1280px; margin: 0 auto; padding: 0 2rem; }

    .sec-eyebrow { font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--c-gold); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.6rem; }
    .sec-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--c-gold); }
    .sec-title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
    .sec-title em { font-style: italic; color: var(--c-gold); }

    /* ── BENEFITS ───────────────────────────────────── */
    .benefits-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--c-border); }
    @media (max-width: 768px) { .benefits-grid { grid-template-columns: repeat(2, 1fr); } }
    .benefit-item { padding: 1.8rem 1.5rem; border-right: 1px solid var(--c-border); display: flex; align-items: center; gap: 1rem; transition: background 0.3s; }
    .benefit-item:last-child { border-right: none; }
    .benefit-item:hover { background: rgba(212,168,83,0.05); }
    .benefit-icon { width: 44px; height: 44px; border: 1px solid var(--c-border); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .benefit-title { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
    .benefit-sub { font-size: 11px; color: var(--c-muted); letter-spacing: 0.03em; }

    /* ── CATEGORIES ─────────────────────────────────── */
    .cat-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2px; height: 580px; }
    @media (max-width: 768px) { .cat-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; height: auto; } }
    .cat-card { position: relative; overflow: hidden; cursor: pointer; }
    .cat-card:first-child { grid-row: 1 / 3; }
    .cat-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
    .cat-card:hover .cat-img { transform: scale(1.07); }
    .cat-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,8,16,0.8) 0%, transparent 60%); }
    .cat-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 1.5rem; }
    .cat-name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .cat-cta { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--c-gold); border-bottom: 1px solid transparent; transition: border-color 0.3s; }
    .cat-card:hover .cat-cta { border-color: var(--c-gold); }

    /* ── PRODUCT CARD ───────────────────────────────── */
    .prod-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--c-border); border: 1px solid var(--c-border); }
    @media (max-width: 1024px) { .prod-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 640px) { .prod-grid { grid-template-columns: repeat(2, 1fr); } }

    .prod-card { background: var(--c-card); position: relative; cursor: pointer; transition: background 0.3s; }
    .prod-card:hover { background: #1a1a28; }
    .prod-thumb { position: relative; overflow: hidden; aspect-ratio: 3/4; }
    .prod-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
    .prod-card:hover .prod-img { transform: scale(1.06); }
    .prod-badges { position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 5px; }
    .badge { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 10px; font-weight: 700; }
    .badge-off { background: var(--c-accent2); color: white; }
    .badge-new { background: var(--c-gold); color: #0a0a14; }
    .prod-wish { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; background: rgba(8,8,16,0.7); backdrop-filter: blur(6px); border: 1px solid var(--c-border); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; cursor: pointer; color: var(--c-text); }
    .prod-card:hover .prod-wish { opacity: 1; }
    .prod-wish:hover { color: var(--c-accent2); border-color: var(--c-accent2); }
    .prod-actions { position: absolute; bottom: 0; left: 0; right: 0; display: flex; transform: translateY(100%); transition: transform 0.35s ease; }
    .prod-card:hover .prod-actions { transform: translateY(0); }
    .prod-action-btn { flex: 1; padding: 10px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; border: none; cursor: pointer; transition: background 0.2s; font-family: var(--font-body); }
    .btn-view { background: rgba(20,20,32,0.9); color: var(--c-text); border-right: 1px solid var(--c-border); }
    .btn-view:hover { background: var(--c-surface); }
    .btn-cart { background: var(--c-gold); color: #0a0a14; }
    .btn-cart:hover { background: var(--c-gold-lt); }

    .prod-info { padding: 1rem 1.2rem 1.2rem; }
    .prod-name { font-size: 13px; font-weight: 500; margin-bottom: 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .prod-price-row { display: flex; align-items: baseline; gap: 8px; }
    .prod-price { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--c-gold); }
    .prod-orig { font-size: 11px; color: var(--c-muted); text-decoration: line-through; }
    .prod-rating { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .star { color: var(--c-gold); font-size: 11px; }
    .rating-count { font-size: 10px; color: var(--c-muted); }

    /* ── DEAL CARD ──────────────────────────────────── */
    .deal-card { background: var(--c-card); border: 1px solid var(--c-border); position: relative; overflow: hidden; }
    .deal-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(124,106,247,0.07) 0%, transparent 60%); pointer-events: none; }
    .deal-timer { position: absolute; top: 10px; left: 10px; background: rgba(232,93,156,0.9); backdrop-filter: blur(4px); color: white; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; font-weight: 700; }

    /* ── MARQUEE BRANDS ─────────────────────────────── */
    .marquee-wrap { overflow: hidden; border-top: 1px solid var(--c-border); border-bottom: 1px solid var(--c-border); padding: 1.5rem 0; }
    .marquee-inner { display: flex; gap: 0; white-space: nowrap; animation: marquee 20s linear infinite; }
    .marquee-item { font-family: var(--font-display); font-size: 1.4rem; font-style: italic; color: var(--c-muted); padding: 0 2rem; transition: color 0.3s; }
    .marquee-item:hover { color: var(--c-gold); }
    .marquee-sep { color: var(--c-gold); padding: 0 0.5rem; }
    @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

    /* ── BANNER ─────────────────────────────────────── */
    .promo-banner { position: relative; overflow: hidden; background: var(--c-surface); border: 1px solid var(--c-border); display: grid; grid-template-columns: 1fr 1fr; min-height: 320px; }
    @media (max-width: 768px) { .promo-banner { grid-template-columns: 1fr; } }
    .promo-left { padding: 3.5rem; display: flex; flex-direction: column; justify-content: center; }
    .promo-tag { display: inline-block; background: var(--c-accent2); color: white; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; padding: 4px 12px; font-weight: 700; margin-bottom: 1.2rem; }
    .promo-title { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 900; line-height: 1.05; margin-bottom: 1rem; }
    .promo-title span { color: var(--c-gold); }
    .promo-desc { font-size: 13px; color: var(--c-muted); line-height: 1.7; margin-bottom: 1.8rem; max-width: 360px; }
    .promo-right { position: relative; overflow: hidden; min-height: 280px; }
    .promo-right img { width: 100%; height: 100%; object-fit: cover; }
    .promo-right::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--c-surface) 0%, transparent 25%); }

    /* ── TESTIMONIALS ───────────────────────────────── */
    .testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--c-border); border: 1px solid var(--c-border); }
    @media (max-width: 768px) { .testi-grid { grid-template-columns: 1fr; } }
    .testi-card { background: var(--c-card); padding: 2rem; position: relative; }
    .testi-quote { font-family: var(--font-display); font-size: 4rem; line-height: 1; color: var(--c-gold); opacity: 0.3; position: absolute; top: 1rem; right: 1.5rem; }
    .testi-text { font-size: 13px; line-height: 1.8; color: rgba(240,237,232,0.8); margin-bottom: 1.5rem; font-style: italic; }
    .testi-author { display: flex; align-items: center; gap: 0.8rem; }
    .testi-av { width: 38px; height: 38px; background: linear-gradient(135deg, var(--c-accent), var(--c-accent2)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
    .testi-name { font-size: 13px; font-weight: 600; }
    .testi-loc { font-size: 10px; color: var(--c-muted); letter-spacing: 0.1em; }

    /* ── NEWSLETTER ─────────────────────────────────── */
    .nl-section { background: var(--c-surface); border-top: 1px solid var(--c-border); border-bottom: 1px solid var(--c-border); padding: 5rem 0; }
    .nl-input-row { display: flex; max-width: 500px; border: 1px solid var(--c-border); }
    .nl-input { flex: 1; background: rgba(255,255,255,0.04); border: none; padding: 1rem 1.4rem; font-family: var(--font-body); font-size: 13px; color: var(--c-text); outline: none; }
    .nl-input::placeholder { color: var(--c-muted); }
    .nl-btn { background: var(--c-gold); color: #0a0a14; border: none; padding: 1rem 1.8rem; font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
    .nl-btn:hover { background: var(--c-gold-lt); }

    /* ── SKELETON ───────────────────────────────────── */
    .skel { background: linear-gradient(90deg, var(--c-card) 0%, #1e1e2e 50%, var(--c-card) 100%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

    /* ── BUTTONS ────────────────────────────────────── */
    .btn-gold { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--c-gold); color: #0a0a14; border: none; padding: 0.9rem 2rem; font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-gold:hover { background: var(--c-gold-lt); }
    .btn-outline { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: var(--c-text); border: 1px solid var(--c-border); padding: 0.9rem 2rem; font-family: var(--font-body); font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; text-decoration: none; }
    .btn-outline:hover { border-color: var(--c-gold); color: var(--c-gold); }

    /* ── SECTION HEADER ─────────────────────────────── */
    .sec-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2.5rem; }
    .see-all { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--c-muted); border-bottom: 1px solid var(--c-border); padding-bottom: 2px; text-decoration: none; transition: color 0.2s, border-color 0.2s; }
    .see-all:hover { color: var(--c-gold); border-color: var(--c-gold); }

    /* ── TRUST BADGES ───────────────────────────────── */
    .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--c-border); border: 1px solid var(--c-border); }
    @media (max-width: 640px) { .trust-grid { grid-template-columns: repeat(2, 1fr); } }
    .trust-item { background: var(--c-card); padding: 2rem 1.5rem; text-align: center; transition: background 0.3s; }
    .trust-item:hover { background: #1a1a28; }
    .trust-icon { font-size: 2rem; margin-bottom: 0.8rem; }
    .trust-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .trust-sub { font-size: 11px; color: var(--c-muted); }

    /* ── PRODUCT SKELETON ───────────────────────────── */
    .prod-skel { background: var(--c-card); }
    .prod-skel-thumb { aspect-ratio: 3/4; }
    .prod-skel-info { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 8px; }
  `}</style>
);

// ── Utilities ────────────────────────────────────────────
const getImageUrl = (img, i = 0) => {
  if (img) return img;
  const cats = [
    "shirt",
    "dress",
    "jacket",
    "tshirt",
    "shoes",
    "watch",
    "bag",
    "pants",
  ];
  return `https://picsum.photos/600/800?random=${i + 10}`;
};

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const disc = (p, o) => (o ? Math.round(((o - p) / o) * 100) : 0);

// ── Stars ────────────────────────────────────────────────
const Stars = ({ r = 4.5 }) => {
  const safeRating = Number(r) || 4.5;
  const stars = Math.round(Math.max(0, Math.min(5, safeRating)));
  return (
    <div className="prod-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="star">
          {i <= stars ? "★" : "☆"}
        </span>
      ))}
      <span className="rating-count">{safeRating.toFixed(1)}</span>
    </div>
  );
};

// ── Skeleton ─────────────────────────────────────────────
const ProdSkeleton = () => (
  <div className="prod-skel">
    <div className="prod-skel-thumb skel" />
    <div className="prod-skel-info">
      <div className="skel" style={{ height: 13, borderRadius: 2 }} />
      <div
        className="skel"
        style={{ height: 13, width: "60%", borderRadius: 2 }}
      />
      <div
        className="skel"
        style={{ height: 18, width: "40%", borderRadius: 2 }}
      />
    </div>
  </div>
);

// ── Product Card ─────────────────────────────────────────
const ProductCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const d = disc(product.price, product.originalPrice);

  const onCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added to cart`, {
      style: {
        background: "#13131f",
        color: "#f0ede8",
        border: "1px solid rgba(212,168,83,0.3)",
        fontFamily: "Outfit, sans-serif",
        fontSize: "13px",
      },
      icon: "🛒",
    });
  };

  return (
    <motion.div
      className="prod-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
    >
      <div className="prod-thumb">
        <Link to={`/product/${product._id}`}>
          <img
            className="prod-img"
            src={getImageUrl(product.image, index)}
            alt={product.name}
            loading="lazy"
            onError={(e) => (e.target.src = getImageUrl(null, index))}
          />
        </Link>
        <div className="prod-badges">
          {d > 5 && <span className="badge badge-off">{d}% Off</span>}
          {product.isNew && <span className="badge badge-new">New</span>}
        </div>
        <button className="prod-wish" aria-label="Wishlist">
          ♡
        </button>
        <div className="prod-actions">
          <Link
            to={`/product/${product._id}`}
            className="prod-action-btn btn-view"
          >
            View Details
          </Link>
          <button className="prod-action-btn btn-cart" onClick={onCart}>
            Add to Cart
          </button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-name">{product.name}</div>
        <Stars r={Number(product.rating) || 4.2} />
        <div className="prod-price-row" style={{ marginTop: 6 }}>
          <span className="prod-price">₹{fmt(product.price)}</span>
          {product.originalPrice && (
            <span className="prod-orig">₹{fmt(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Deal Card ─────────────────────────────────────────────
const DealCard = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const d = disc(product.price, product.originalPrice);
  const hrs = Math.max(1, 24 - index * 3);

  return (
    <motion.div
      className="prod-card deal-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07 }}
    >
      <div className="prod-thumb">
        <Link to={`/product/${product._id}`}>
          <img
            className="prod-img"
            src={getImageUrl(product.image, index + 20)}
            alt={product.name}
            loading="lazy"
          />
        </Link>
        <div className="deal-timer">⏱ {hrs}h left</div>
        {d > 0 && (
          <div
            className="prod-badges"
            style={{ top: 10, left: "auto", right: 10 }}
          >
            <span className="badge badge-off">{d}%</span>
          </div>
        )}
        <div className="prod-actions">
          <Link
            to={`/product/${product._id}`}
            className="prod-action-btn btn-view"
          >
            View
          </Link>
          <button
            className="prod-action-btn btn-cart"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
              toast.success("Added!", {
                style: {
                  background: "#13131f",
                  color: "#f0ede8",
                  border: "1px solid rgba(212,168,83,0.3)",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "13px",
                },
              });
            }}
          >
            Cart
          </button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-name">{product.name}</div>
        <div className="prod-price-row" style={{ marginTop: 4 }}>
          <span className="prod-price">₹{fmt(product.price)}</span>
          {product.originalPrice && (
            <span className="prod-orig">₹{fmt(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Hero Slider ───────────────────────────────────────────
const SLIDES = [
  {
    img: "https://picsum.photos/1400/800?random=101",
    eyebrow: "New Collection 2025",
    title: "Wear The",
    titleItalic: "Extraordinary",
    sub: "Discover pieces that define you. Luxury fashion curated for the bold.",
    cta: "Explore Now",
    ctaLink: "/shop",
    badge: "Up to 70% Off",
  },
  {
    img: "https://picsum.photos/1400/800?random=102",
    eyebrow: "Men's Exclusive",
    title: "Redefine",
    titleItalic: "Your Style",
    sub: "Premium menswear crafted with precision. Be unforgettable.",
    cta: "Shop Men",
    ctaLink: "/shop?cat=men",
    badge: "Free Shipping",
  },
  {
    img: "https://picsum.photos/1400/800?random=103",
    eyebrow: "Summer Edit",
    title: "Summer",
    titleItalic: "Reinvented",
    sub: "Effortless silhouettes for sun-drenched days. The season's finest.",
    cta: "View Collection",
    ctaLink: "/shop?cat=summer",
    badge: "New Arrivals",
  },
];

const HeroSlider = () => {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const timer = useRef(null);

  const go = useCallback(
    (n) => {
      setDir(n > cur ? 1 : -1);
      setCur(n);
    },
    [cur],
  );

  const next = useCallback(() => go((cur + 1) % SLIDES.length), [cur, go]);
  const prev = useCallback(
    () => go((cur - 1 + SLIDES.length) % SLIDES.length),
    [cur, go],
  );

  useEffect(() => {
    timer.current = setInterval(next, 5500);
    return () => clearInterval(timer.current);
  }, [next]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? "8%" : "-8%", opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (d) => ({
      x: d > 0 ? "-8%" : "8%",
      opacity: 0,
      transition: { duration: 0.5 },
    }),
  };

  const s = SLIDES[cur];

  return (
    <section
      style={{
        position: "relative",
        height: "92vh",
        minHeight: 560,
        overflow: "hidden",
      }}
    >
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={cur}
          className="hero-slide"
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <motion.img
            className="hero-img"
            src={s.img}
            alt={s.title}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
          />
          <div className="hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <motion.div
            key={`ey-${cur}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--c-gold)",
              marginBottom: "1.2rem",
            }}
          >
            <span
              style={{
                width: 24,
                height: 1,
                background: "var(--c-gold)",
                display: "inline-block",
              }}
            />
            {s.eyebrow}
          </motion.div>

          <motion.h1
            key={`t-${cur}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem,7vw,5.5rem)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: "1.5rem",
            }}
          >
            {s.title}
            <br />
            <em style={{ fontStyle: "italic", color: "var(--c-gold)" }}>
              {s.titleItalic}
            </em>
          </motion.h1>

          <motion.p
            key={`s-${cur}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "rgba(240,237,232,0.75)",
              marginBottom: "2.2rem",
              maxWidth: 420,
            }}
          >
            {s.sub}
          </motion.p>

          <motion.div
            key={`b-${cur}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            style={{
              display: "flex",
              gap: "0.8rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link to={s.ctaLink} className="btn-gold">
              {s.cta} →
            </Link>
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--c-gold)",
                border: "1px solid rgba(212,168,83,0.3)",
                padding: "0.5rem 1rem",
              }}
            >
              {s.badge}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Nav */}
      <button className="hero-nav hero-nav-l" onClick={prev}>
        ‹
      </button>
      <button className="hero-nav hero-nav-r" onClick={next}>
        ›
      </button>

      {/* Dots */}
      <div className="slide-dots">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`slide-dot ${i === cur ? "active" : ""}`}
            onClick={() => go(i)}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="slide-counter">
        {String(cur + 1).padStart(2, "0")} /{" "}
        {String(SLIDES.length).padStart(2, "0")}
      </div>
    </section>
  );
};

// ── Main ─────────────────────────────────────────────────
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [nlDone, setNlDone] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await getProducts();
        if (live)
          setProducts(
            Array.isArray(data?.products)
              ? data.products
              : Array.isArray(data)
                ? data
                : [],
          );
      } catch {
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const featured = products.slice(0, 8);
  const deals = products.filter((p) => p.price < 1000).slice(0, 4);
  const arrivals = products.slice(0, 12);

  const categories = [
    {
      name: "Women",
      sub: "New Arrivals",
      img: "https://picsum.photos/800/900?random=10",
    },
    {
      name: "Men",
      sub: "Premium Edit",
      img: "https://picsum.photos/400/400?random=11",
    },
    {
      name: "Kids",
      sub: "Fresh Styles",
      img: "https://picsum.photos/400/400?random=12",
    },
    {
      name: "Accessories",
      sub: "Must Haves",
      img: "https://picsum.photos/400/400?random=13",
    },
  ];

  const testimonials = [
    {
      name: "Rahul S.",
      loc: "Mumbai",
      text: "Absolutely stunning quality. Every piece I've ordered has been perfect — fast delivery, beautiful packaging. This is my go-to store now.",
    },
    {
      name: "Priya P.",
      loc: "Delhi",
      text: "The curation here is unlike anything else. Found exactly what I was looking for. The fabric quality exceeded every expectation.",
    },
    {
      name: "Amit K.",
      loc: "Bangalore",
      text: "Customer service is incredible. Had an issue with sizing and they sorted it out within hours. Will shop here forever.",
    },
  ];

  const onNl = (e) => {
    e.preventDefault();
    if (!email) return;
    setNlDone(true);
    toast.success("Subscribed! Watch your inbox.", {
      style: {
        background: "#13131f",
        color: "#f0ede8",
        border: "1px solid rgba(212,168,83,0.3)",
        fontFamily: "Outfit, sans-serif",
        fontSize: "13px",
      },
    });
  };

  const BRANDS = [
    "Zara",
    "H&M",
    "Mango",
    "Louis Philippe",
    "AND",
    "Fabindia",
    "Westside",
    "Global Desi",
  ];

  return (
    <div className="h-root">
      <GlobalStyles />
      <Toaster position="top-right" />

      {/* ── Hero Slider ─────────────────────────────── */}
      <HeroSlider />

      {/* ── Benefits ────────────────────────────────── */}
      <motion.div
        className="benefits-grid container"
        style={{ marginTop: "3rem" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {[
          { icon: "✈", title: "Free Shipping", sub: "Orders above ₹500" },
          { icon: "↩", title: "Easy Returns", sub: "30-day policy" },
          { icon: "🔒", title: "Secure Payment", sub: "256-bit SSL" },
          { icon: "◎", title: "24/7 Support", sub: "Always here for you" },
        ].map((b, i) => (
          <motion.div
            key={b.title}
            className="benefit-item"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="benefit-icon">
              <span style={{ fontSize: 20 }}>{b.icon}</span>
            </div>
            <div>
              <div className="benefit-title">{b.title}</div>
              <div className="benefit-sub">{b.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Brand Marquee ────────────────────────────── */}
      <div className="marquee-wrap" style={{ marginTop: "3.5rem" }}>
        <div className="marquee-inner">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <React.Fragment key={i}>
              <span className="marquee-item">{b}</span>
              <span className="marquee-sep">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Categories ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Shop by Category</div>
              <h2 className="sec-title">
                Find Your <em>Style</em>
              </h2>
            </div>
            <Link to="/category" className="see-all">
              All Categories →
            </Link>
          </div>
          <motion.div
            className="cat-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                className="cat-card"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <img className="cat-img" src={cat.img} alt={cat.name} />
                <div className="cat-overlay" />
                <div className="cat-label">
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-cta">{cat.sub} →</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Handpicked for You</div>
              <h2 className="sec-title">
                Featured <em>Products</em>
              </h2>
            </div>
            <Link to="/shop?sort=popular" className="see-all">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="prod-grid">
              {[...Array(8)].map((_, i) => (
                <ProdSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="prod-grid">
              {featured.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo Banner ─────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <motion.div
            className="promo-banner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="promo-left">
              <span className="promo-tag">Limited Time</span>
              <h2 className="promo-title">
                Flat <span>50% Off</span>
                <br />
                Summer Edit
              </h2>
              <p className="promo-desc">
                Our biggest summer sale is here. Fresh silhouettes, vibrant
                palettes — all at half the price. Offer ends Sunday.
              </p>
              <div style={{ display: "flex", gap: "0.8rem" }}>
                <Link to="/shop?cat=summer" className="btn-gold">
                  Shop the Sale →
                </Link>
                <Link to="/deals" className="btn-outline">
                  All Deals
                </Link>
              </div>
            </div>
            <div className="promo-right">
              <img
                src="https://picsum.photos/700/500?random=50"
                alt="Summer sale"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Today's Deals ────────────────────────────── */}
      {!loading && deals.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="sec-header">
              <div>
                <div className="sec-eyebrow">Flash Deals</div>
                <h2 className="sec-title">
                  Today's <em>Hot Picks</em>
                </h2>
              </div>
              <Link to="/deals" className="see-all">
                All Deals →
              </Link>
            </div>
            <div
              className="prod-grid"
              style={{ gridTemplateColumns: "repeat(4,1fr)" }}
            >
              {deals.map((p, i) => (
                <DealCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Just Dropped</div>
              <h2 className="sec-title">
                New <em>Arrivals</em>
              </h2>
            </div>
            <Link to="/shop?sort=newest" className="see-all">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="prod-grid">
              {[...Array(8)].map((_, i) => (
                <ProdSkeleton key={i} />
              ))}
            </div>
          ) : arrivals.length === 0 ? (
            <div
              style={{
                padding: "4rem",
                textAlign: "center",
                border: "1px solid var(--c-border)",
                color: "var(--c-muted)",
              }}
            >
              <p>No products yet — check back soon.</p>
            </div>
          ) : (
            <div className="prod-grid">
              {arrivals.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="sec-header">
            <div>
              <div className="sec-eyebrow">Customer Stories</div>
              <h2 className="sec-title">
                Loved by <em>Thousands</em>
              </h2>
            </div>
          </div>
          <motion.div
            className="testi-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="testi-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="testi-quote">"</div>
                <div style={{ display: "flex", gap: 2, marginBottom: "1rem" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{ color: "var(--c-gold)", fontSize: 13 }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-author">
                  <div className="testi-av">{t.name[0]}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-loc">{t.loc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="trust-grid">
            {[
              {
                icon: "🛡",
                title: "Secure Checkout",
                sub: "256-bit SSL encryption",
              },
              {
                icon: "🚚",
                title: "Fast Delivery",
                sub: "Free shipping over ₹500",
              },
              { icon: "↩", title: "Easy Returns", sub: "30-day return policy" },
              {
                icon: "💯",
                title: "100% Original",
                sub: "Authentic products only",
              },
            ].map((t, i) => (
              <motion.div
                key={t.title}
                className="trust-item"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="trust-icon">{t.icon}</div>
                <div className="trust-title">{t.title}</div>
                <div className="trust-sub">{t.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────── */}
      <div className="nl-section">
        <div className="container">
          <motion.div
            style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>
              Stay in the Loop
            </div>
            <h2 className="sec-title" style={{ marginBottom: "1rem" }}>
              Get <em>Exclusive</em> Access
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--c-muted)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Early drops, member-only deals, and style edits — delivered to
              your inbox.
            </p>
            <AnimatePresence mode="wait">
              {!nlDone ? (
                <motion.form
                  key="form"
                  className="nl-input-row"
                  style={{ margin: "0 auto" }}
                  onSubmit={onNl}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <input
                    className="nl-input"
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="nl-btn">
                    Subscribe →
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    color: "var(--c-gold)",
                    fontSize: 14,
                    letterSpacing: "0.05em",
                    border: "1px solid rgba(212,168,83,0.3)",
                    padding: "1rem 2rem",
                    display: "inline-block",
                  }}
                >
                  ✦ You're on the list. Welcome to the family.
                </motion.div>
              )}
            </AnimatePresence>
            <p
              style={{
                fontSize: 10,
                color: "var(--c-muted)",
                marginTop: "1rem",
                letterSpacing: "0.1em",
              }}
            >
              No spam. Unsubscribe any time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Ticker ───────────────────────────────────── */}
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...Array(3)].flatMap((_, groupIdx) =>
            [
              "Free Shipping on ₹500+",
              "New Collection 2025",
              "30-Day Easy Returns",
              "Secure Checkout",
              "24/7 Support",
              "Up to 70% Off",
            ].map((t, i) => (
              <span key={`ticker-${groupIdx}-${i}`} className="ticker-item">
                — {t}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
