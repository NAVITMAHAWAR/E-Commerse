import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Search,
  Truck,
  Package,
  Shield,
  Headphones,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  CreditCard,
  Zap,
  Star,
  CheckCircle,
  Send,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

/* ── Google Fonts injected once ─────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0a0a0f;
      --paper: #f5f2eb;
      --cream: #ede9df;
      --gold: #c9a84c;
      --gold-light: #e8c97a;
      --rust: #c4522a;
      --sage: #4a7c59;
      --muted: #7a7569;
      --border: rgba(201,168,76,0.2);
    }

    html { scroll-behavior: smooth; }

    body { background: var(--ink); color: var(--paper); font-family: 'DM Mono', monospace; }

    .hc-root {
      min-height: 100vh;
      background: var(--ink);
      color: var(--paper);
      overflow-x: hidden;
      font-family: 'DM Mono', monospace;
    }

    /* Noise overlay */
    .hc-root::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      opacity: 0.35;
    }

    /* ── HERO ───────────────────────────────────────── */
    .hero {
      position: relative; z-index: 1;
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 6rem 2rem 4rem;
      text-align: center;
      overflow: hidden;
    }

    .hero-bg-circle {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
    }

    .hero-label {
      font-family: 'DM Mono', monospace;
      font-size: 0.7rem; letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--gold);
      border: 1px solid var(--border);
      padding: 0.4rem 1.2rem;
      border-radius: 100px;
      margin-bottom: 2.5rem;
      display: inline-block;
    }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(3.5rem, 10vw, 9rem);
      font-weight: 800;
      line-height: 0.9;
      letter-spacing: -0.04em;
      margin-bottom: 1.5rem;
    }

    .hero-title .gold { color: var(--gold); font-family: 'Instrument Serif', serif; font-style: italic; }

    .hero-sub {
      font-size: 0.9rem; letter-spacing: 0.05em;
      color: var(--muted);
      max-width: 480px;
      line-height: 1.8;
      margin-bottom: 3rem;
    }

    /* ── SEARCH ─────────────────────────────────────── */
    .search-wrap {
      position: relative; width: 100%; max-width: 560px;
    }
    .search-wrap svg {
      position: absolute; left: 1.4rem; top: 50%;
      transform: translateY(-50%);
      color: var(--gold); width: 18px; height: 18px;
    }
    .search-input {
      width: 100%;
      background: rgba(245,242,235,0.05);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1.1rem 1.5rem 1.1rem 3.5rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.85rem;
      color: var(--paper);
      outline: none;
      transition: border-color 0.3s, background 0.3s;
      letter-spacing: 0.03em;
    }
    .search-input::placeholder { color: var(--muted); }
    .search-input:focus {
      border-color: var(--gold);
      background: rgba(201,168,76,0.05);
    }

    /* ── STATS BAR ──────────────────────────────────── */
    .stats-bar {
      position: relative; z-index: 1;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      display: grid; grid-template-columns: repeat(4, 1fr);
      padding: 0 4rem;
    }

    .stat-item {
      padding: 2rem 1rem;
      text-align: center;
      border-right: 1px solid var(--border);
    }
    .stat-item:last-child { border-right: none; }

    .stat-num {
      font-family: 'Syne', sans-serif;
      font-size: 2.5rem; font-weight: 800;
      color: var(--gold); line-height: 1;
      margin-bottom: 0.4rem;
    }
    .stat-label {
      font-size: 0.65rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--muted);
    }

    /* ── SECTION TITLES ─────────────────────────────── */
    .section-label {
      font-size: 0.65rem; letter-spacing: 0.3em;
      text-transform: uppercase; color: var(--gold);
      margin-bottom: 1rem;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800; line-height: 1;
      letter-spacing: -0.03em;
    }
    .section-title em {
      font-family: 'Instrument Serif', serif;
      font-style: italic; color: var(--gold);
      font-weight: 400;
    }

    /* ── QUICK ACTIONS ──────────────────────────────── */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
    }

    @media (min-width: 768px) {
      .actions-grid { grid-template-columns: repeat(4, 1fr); }
    }

    .action-card {
      background: var(--ink);
      padding: 2.5rem 2rem;
      cursor: pointer;
      transition: background 0.3s;
      position: relative; overflow: hidden;
    }
    .action-card::after {
      content: '';
      position: absolute; bottom: 0; left: 0;
      height: 2px; width: 0;
      background: var(--gold);
      transition: width 0.4s ease;
    }
    .action-card:hover { background: rgba(201,168,76,0.06); }
    .action-card:hover::after { width: 100%; }

    .action-icon {
      width: 44px; height: 44px;
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
      color: var(--gold);
      transition: border-color 0.3s;
    }
    .action-card:hover .action-icon { border-color: var(--gold); }

    .action-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.1rem; font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .action-desc { font-size: 0.72rem; color: var(--muted); line-height: 1.6; letter-spacing: 0.02em; }
    .action-arrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 0.7rem; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--gold);
      margin-top: 1.2rem;
      transition: gap 0.2s;
    }
    .action-card:hover .action-arrow { gap: 0.7rem; }

    /* ── FAQ ────────────────────────────────────────── */
    .faq-wrap {
      border: 1px solid var(--border);
    }

    .faq-item {
      border-bottom: 1px solid var(--border);
      transition: background 0.2s;
    }
    .faq-item:last-child { border-bottom: none; }
    .faq-item:hover { background: rgba(201,168,76,0.03); }

    .faq-btn {
      width: 100%; display: flex; align-items: center;
      justify-content: space-between;
      padding: 1.6rem 2rem;
      background: transparent; border: none;
      cursor: pointer; color: var(--paper);
      font-family: 'DM Mono', monospace;
      font-size: 0.82rem; letter-spacing: 0.02em;
      text-align: left; gap: 1rem;
    }

    .faq-q-wrap { display: flex; align-items: center; gap: 1rem; }

    .faq-icon {
      width: 32px; height: 32px; flex-shrink: 0;
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--gold);
    }

    .faq-chevron {
      width: 32px; height: 32px; flex-shrink: 0;
      border: 1px solid var(--border);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s, border-color 0.3s;
      color: var(--muted);
    }
    .faq-chevron.open { transform: rotate(180deg); border-color: var(--gold); color: var(--gold); }

    .faq-answer {
      padding: 0 2rem 1.6rem 5rem;
      font-size: 0.8rem; color: var(--muted);
      line-height: 2; letter-spacing: 0.02em;
    }

    /* ── CATEGORIES ─────────────────────────────────── */
    .cat-row {
      display: flex; flex-wrap: wrap; gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .cat-btn {
      font-family: 'DM Mono', monospace;
      font-size: 0.65rem; letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 0.5rem 1.2rem;
      border: 1px solid var(--border);
      background: transparent; color: var(--muted);
      cursor: pointer; transition: all 0.2s;
      border-radius: 2px;
    }
    .cat-btn:hover { border-color: var(--gold); color: var(--gold); }
    .cat-btn.active { background: var(--gold); color: var(--ink); border-color: var(--gold); }

    /* ── CONTACT SECTION ────────────────────────────── */
    .contact-grid {
      display: grid; gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
    }
    @media (min-width: 768px) {
      .contact-grid { grid-template-columns: 1fr 2fr; }
    }

    .contact-live {
      background: var(--gold);
      padding: 3rem 2.5rem;
      display: flex; flex-direction: column;
      justify-content: space-between;
    }
    .contact-live-title {
      font-family: 'Syne', sans-serif;
      font-size: 2rem; font-weight: 800;
      color: var(--ink); letter-spacing: -0.03em;
      line-height: 1.1; margin-bottom: 0.8rem;
    }
    .contact-live-sub { font-size: 0.75rem; color: rgba(10,10,15,0.6); line-height: 1.6; letter-spacing: 0.03em; }
    .live-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--ink); color: var(--gold);
      font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
      padding: 0.5rem 1rem; margin-bottom: 2rem;
      border-radius: 2px;
    }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: blink 1.5s ease infinite; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .chat-btn {
      background: var(--ink); color: var(--gold);
      border: none; padding: 1rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.85rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; transition: opacity 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
    }
    .chat-btn:hover { opacity: 0.85; }

    .contact-channels { background: var(--ink); padding: 3rem 2.5rem; }

    .channel-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 1px; background: var(--border);
      border: 1px solid var(--border);
      margin-bottom: 2.5rem;
    }
    .channel-item {
      background: var(--ink);
      padding: 1.5rem;
      transition: background 0.2s;
    }
    .channel-item:hover { background: rgba(201,168,76,0.05); }
    .channel-icon { color: var(--gold); margin-bottom: 0.8rem; }
    .channel-label { font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; }
    .channel-val { font-size: 0.78rem; color: var(--paper); }
    .channel-val a { color: var(--gold); text-decoration: none; }
    .channel-val a:hover { text-decoration: underline; }

    /* ── FORM ───────────────────────────────────────── */
    .hc-form { display: flex; flex-direction: column; gap: 0.8rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }

    .hc-input, .hc-textarea {
      background: rgba(245,242,235,0.04);
      border: 1px solid var(--border);
      padding: 0.9rem 1.2rem;
      font-family: 'DM Mono', monospace;
      font-size: 0.78rem; letter-spacing: 0.03em;
      color: var(--paper); outline: none;
      transition: border-color 0.2s, background 0.2s;
      border-radius: 2px; width: 100%;
    }
    .hc-input::placeholder, .hc-textarea::placeholder { color: var(--muted); }
    .hc-input:focus, .hc-textarea:focus {
      border-color: var(--gold);
      background: rgba(201,168,76,0.04);
    }
    .hc-textarea { resize: vertical; min-height: 100px; }

    .submit-btn {
      background: var(--gold); color: var(--ink);
      border: none; padding: 1rem 2rem;
      font-family: 'Syne', sans-serif;
      font-size: 0.85rem; font-weight: 800;
      letter-spacing: 0.15em; text-transform: uppercase;
      cursor: pointer; transition: opacity 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      border-radius: 2px;
    }
    .submit-btn:hover { opacity: 0.88; }

    /* ── LAYOUT HELPERS ─────────────────────────────── */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    .section { position: relative; z-index: 1; padding: 6rem 0; }
    .divider { height: 1px; background: var(--border); }
  `}</style>
);

/* ── Data ─────────────────────────────────────────────── */
const FAQS = [
  {
    q: "What are your shipping options and delivery times?",
    a: "We offer Standard (3–5 days), Express (1–2 days), and Same-Day delivery in select cities. Free shipping on orders above ₹500. All orders are tracked in real-time via your account.",
    category: "shipping",
    icon: Truck,
  },
  {
    q: "How can I track my order?",
    a: "Navigate to My Orders in your account dashboard. Real-time updates are pushed via email and SMS at every stage — from dispatch to doorstep.",
    category: "orders",
    icon: Package,
  },
  {
    q: "What is your return policy?",
    a: "30-day hassle-free returns on all items. Initiate returns via My Orders → Return Item. Full refund is processed within 7 business days to your original payment method.",
    category: "returns",
    icon: ArrowRight,
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. We use 256-bit SSL encryption and our payment gateway (Razorpay) is fully PCI-DSS Level 1 compliant. We never store your card details.",
    category: "payments",
    icon: Shield,
  },
  {
    q: "How do I contact customer support?",
    a: "Our support team is available 24/7 via Live Chat, Email (support@store.com), and Phone (+91 98765 43210). Average response time is under 3 minutes.",
    category: "support",
    icon: Headphones,
  },
  {
    q: "Can I modify or cancel my order?",
    a: "Orders can be modified or cancelled within 30 minutes of placement. After that, you may need to wait for delivery and initiate a return.",
    category: "orders",
    icon: Package,
  },
];

const STATS = [
  { num: "24/7", label: "Support Available" },
  { num: "<3m", label: "Avg Response Time" },
  { num: "98%", label: "Resolution Rate" },
  { num: "2M+", label: "Happy Customers" },
];

const CATS = ["all", "shipping", "orders", "returns", "payments", "support"];

const ACTIONS = [
  {
    icon: Package,
    title: "Track Order",
    desc: "Real-time location & ETA",
    key: "track",
  },
  {
    icon: ArrowRight,
    title: "Start Return",
    desc: "30-day easy returns",
    key: "return",
  },
  {
    icon: CreditCard,
    title: "Payment Issue",
    desc: "Refunds & disputes",
    key: "payment",
  },
  {
    icon: Headphones,
    title: "Talk to Us",
    desc: "Live human support",
    key: "contact",
  },
];

/* ── Component ────────────────────────────────────────── */
export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [cat, setCat] = useState("all");
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [sent, setSent] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const filtered = FAQS.filter((f) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s || f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s);
    const matchCat = cat === "all" || f.category === cat;
    return matchSearch && matchCat;
  });

  const handleAction = (key) => {
    const msgs = {
      track: "📦 Redirecting to order tracker...",
      return: "↩️ Opening returns portal...",
      payment: "💳 Connecting to payment support...",
      contact: "💬 Starting live chat...",
    };
    toast(msgs[key], {
      style: {
        background: "#0a0a0f",
        color: "#c9a84c",
        border: "1px solid rgba(201,168,76,0.3)",
        fontFamily: "DM Mono, monospace",
        fontSize: "13px",
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.msg) {
      toast.error("Please fill all fields", {
        style: {
          background: "#0a0a0f",
          color: "#c4522a",
          border: "1px solid rgba(196,82,42,0.3)",
          fontFamily: "DM Mono, monospace",
          fontSize: "13px",
        },
      });
      return;
    }
    setSent(true);
    toast.success("Message sent! We'll reply within 2 hours.", {
      style: {
        background: "#0a0a0f",
        color: "#4a7c59",
        border: "1px solid rgba(74,124,89,0.3)",
        fontFamily: "DM Mono, monospace",
        fontSize: "13px",
      },
    });
    setForm({ name: "", email: "", msg: "" });
  };

  return (
    <div className="hc-root">
      <FontLoader />
      <Toaster position="top-right" />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        {/* BG blobs */}
        <div
          className="hero-bg-circle"
          style={{
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="hero-bg-circle"
          style={{
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(196,82,42,0.08) 0%, transparent 70%)",
            bottom: "20%",
            right: "10%",
          }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container"
          style={{ position: "relative", zIndex: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-label">⬡ Help Center — Est. 2024</div>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            WE'VE
            <br />
            <span className="gold">GOT YOU</span>
            <br />
            COVERED.
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Search our knowledge base or connect with our team — answers in
            under 3 minutes, guaranteed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="search-wrap"
            style={{ maxWidth: 560, margin: "0 auto" }}
          >
            <Search />
            <input
              className="search-input"
              type="text"
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              width: 1,
              height: 32,
              background:
                "linear-gradient(to bottom, var(--gold), transparent)",
            }}
          />
        </motion.div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────── */}
      <motion.div
        className="stats-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── QUICK ACTIONS ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: "3rem" }}
          >
            <div className="section-label">// Quick Actions</div>
            <h2 className="section-title">
              SOLVE IT <em>fast.</em>
            </h2>
          </motion.div>

          <motion.div
            className="actions-grid"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {ACTIONS.map((a, i) => (
              <motion.div
                key={a.key}
                className="action-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleAction(a.key)}
              >
                <div className="action-icon">
                  <a.icon size={18} />
                </div>
                <div className="action-title">{a.title}</div>
                <div className="action-desc">{a.desc}</div>
                <div className="action-arrow">
                  Go <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="divider" />

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: "3rem" }}
          >
            <div className="section-label">// Frequently Asked</div>
            <h2 className="section-title">
              YOUR <em>questions,</em>
              <br />
              ANSWERED.
            </h2>
          </motion.div>

          {/* Category filter */}
          <div className="cat-row">
            {CATS.map((c) => (
              <button
                key={c}
                className={`cat-btn ${cat === c ? "active" : ""}`}
                onClick={() => setCat(c)}
              >
                {c === "all" ? "All Topics" : c}
              </button>
            ))}
          </div>

          <motion.div
            className="faq-wrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div
                  style={{
                    padding: "4rem",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  <HelpCircle
                    style={{ margin: "0 auto 1rem", opacity: 0.3 }}
                    size={40}
                  />
                  <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                    No results — try different keywords
                  </p>
                </div>
              ) : (
                filtered.map((faq, i) => (
                  <motion.div
                    key={faq.q}
                    className="faq-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <button
                      className="faq-btn"
                      onClick={() =>
                        setOpenFaq(openFaq === faq.q ? null : faq.q)
                      }
                    >
                      <div className="faq-q-wrap">
                        <div className="faq-icon">
                          <faq.icon size={14} />
                        </div>
                        <span>{faq.q}</span>
                      </div>
                      <div
                        className={`faq-chevron ${openFaq === faq.q ? "open" : ""}`}
                      >
                        <ChevronDown size={14} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openFaq === faq.q && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="faq-answer">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <div className="divider" />

      {/* ── CONTACT ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: "3rem" }}
          >
            <div className="section-label">// Get In Touch</div>
            <h2 className="section-title">
              STILL NEED <em>help?</em>
            </h2>
          </motion.div>

          <motion.div
            className="contact-grid"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Live chat panel */}
            <div className="contact-live">
              <div>
                <div className="live-badge">
                  <div className="live-dot" />
                  Live Now
                </div>
                <div className="contact-live-title">Chat with a Human.</div>
                <div className="contact-live-sub">
                  No bots. No scripts. Real people, available right now —
                  average wait time under 3 minutes.
                </div>
              </div>
              <div style={{ marginTop: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                    marginBottom: "2rem",
                  }}
                >
                  {[
                    "Order tracking",
                    "Returns & refunds",
                    "Payment issues",
                  ].map((t) => (
                    <div
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        fontSize: "0.72rem",
                        color: "rgba(10,10,15,0.7)",
                      }}
                    >
                      <CheckCircle
                        size={12}
                        style={{ color: "var(--ink)", opacity: 0.6 }}
                      />{" "}
                      {t}
                    </div>
                  ))}
                </div>
                <button
                  className="chat-btn"
                  onClick={() => handleAction("contact")}
                >
                  <MessageCircle size={16} /> Start Live Chat
                </button>
              </div>
            </div>

            {/* Form + channels */}
            <div className="contact-channels">
              <div className="channel-row">
                <div className="channel-item">
                  <div className="channel-icon">
                    <Mail size={18} />
                  </div>
                  <div className="channel-label">Email</div>
                  <div className="channel-val">
                    <a href="mailto:mahawarn870@gmail.com">
                      mahawarn870@gmail.com
                    </a>
                  </div>
                </div>
                <div className="channel-item">
                  <div className="channel-icon">
                    <Phone size={18} />
                  </div>
                  <div className="channel-label">Phone</div>
                  <div className="channel-val">
                    <a href="tel:+919664419721">+91 9664419721</a>
                  </div>
                </div>
                <div className="channel-item">
                  <div className="channel-icon">
                    <MessageCircle size={18} />
                  </div>
                  <div className="channel-label">WhatsApp</div>
                  <div className="channel-val">
                    <a href="https://wa.me/9664419721">Chat Now →</a>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form
                    key="form"
                    className="hc-form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="form-row">
                      <input
                        className="hc-input"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                      <input
                        className="hc-input"
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                      />
                    </div>
                    <textarea
                      className="hc-textarea"
                      placeholder="Describe your issue in detail..."
                      value={form.msg}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, msg: e.target.value }))
                      }
                    />
                    <button type="submit" className="submit-btn">
                      <Send size={15} /> Send Message
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <CheckCircle
                      size={40}
                      style={{ color: "var(--sage)", margin: "0 auto 1rem" }}
                    />
                    <div
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Message Received
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      We'll get back to you within 2 hours.
                    </div>
                    <button
                      style={{
                        marginTop: "1.5rem",
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--gold)",
                        padding: "0.6rem 1.4rem",
                        fontFamily: "DM Mono",
                        fontSize: "0.7rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                      onClick={() => setSent(false)}
                    >
                      Send Another
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER BAR ──────────────────────────────────── */}
      <div className="divider" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          © 2024 — Help Center
        </span>
        <div style={{ display: "flex", gap: "2rem" }}>
          {["Privacy", "Terms", "Cookies"].map((l) => (
            <span
              key={l}
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          <Zap size={11} /> All systems operational
        </div>
      </div>
    </div>
  );
}
