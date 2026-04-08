import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useTransition,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  X,
  Send,
  Mic,
  MicOff,
  CreditCard,
  ShoppingBag,
  Package,
  Sparkles,
  ShoppingCart,
  Star,
  Loader2,
} from "lucide-react";
import PaymentModal from "./PaymentModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

// Aarohi Avatar - SVG only
const AarohiAvatar = ({ size = 40, className = "" }) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    width={size}
    height={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="16" r="10" fill="#EDE9FE" />
    <ellipse cx="20" cy="38" rx="14" ry="10" fill="#EDE9FE" />
    <path d="M10 15 Q10 6 20 6 Q30 6 30 15" fill="#5B21B6" />
    <path d="M10 15 Q8 20 10 22" fill="#5B21B6" />
    <path d="M30 15 Q32 20 30 22" fill="#5B21B6" />
    <circle cx="16.5" cy="16" r="1.8" fill="#5B21B6" />
    <circle cx="23.5" cy="16" r="1.8" fill="#5B21B6" />
    <circle cx="17.1" cy="15.4" r="0.6" fill="white" />
    <circle cx="24.1" cy="15.4" r="0.6" fill="white" />
    <path
      d="M16.5 20.5 Q20 23 23.5 20.5"
      stroke="#7C3AED"
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="10.5" cy="19" r="1.2" fill="#A78BFA" />
    <circle cx="29.5" cy="19" r="1.2" fill="#A78BFA" />
  </svg>
);

const UserAvatar = ({ size = 24 }) => (
  <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 font-dm-sans">
    U
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-1 px-4 py-3 items-center">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2.5 h-2.5 bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full ar-typing"
        style={{ animationDelay: `${i * 150}ms` }}
      />
    ))}
  </div>
);

const ProductCard = React.memo(({ product, onAdd }) => (
  <div className="group bg-white/80 ar-glass backdrop-blur-sm rounded-2xl p-4 shadow-xl hover:shadow-2xl border border-white/50 hover:border-violet-200 transition-all hover:-translate-y-1">
    <div className="relative overflow-hidden rounded-xl mb-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
      />
    </div>
    <h4 className="font-dm-sans font-semibold text-sm text-gray-900 line-clamp-2 mb-2">
      {product.name}
    </h4>
    <p className="text-indigo-600 font-bold text-lg mb-2">₹{product.price}</p>
    <div className="flex items-center gap-1 text-xs text-yellow-400 mb-3">
      <Star fill="currentColor" size={14} />
      {Number(product.rating || 0).toFixed(1) || "New"}
    </div>
    <button
      onClick={() => onAdd(product, 1)}
      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02]"
    >
      Add to Cart 🛒
    </button>
  </div>
));

const OrderCard = React.memo(({ order, onPay }) => {
  const getStatus = (order) => {
    if (!order.isPaid) return "Payment Pending 💳";
    if (order.isDelivered) return "Delivered ✅";
    return "Processing... ⏳";
  };

  return (
    <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 ar-glass rounded-2xl p-5 border-2 border-orange-100/80 shadow-2xl hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-200 rounded-2xl">
          <Package className="text-orange-500 w-6 h-6" />
        </div>
        <div>
          <h3 className="font-dm-sans font-bold text-xl text-gray-900">
            Order #{order._id?.slice(-6)}
          </h3>
          <p className="text-sm text-orange-600 font-medium">
            {getStatus(order)}
          </p>
        </div>
      </div>
      <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        ₹{order.totalPrice}
      </p>
      <div className="space-y-2 mb-6 max-h-20 overflow-y-auto">
        {order.orderItems?.slice(0, 3).map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 p-2 bg-white/50 rounded-xl"
          >
            <img
              src={item.image}
              alt=""
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">×{item.qty}</p>
            </div>
          </div>
        ))}
        {order.orderItems?.length > 3 && (
          <p className="text-xs text-gray-500 pl-15">
            +{order.orderItems.length - 3} more
          </p>
        )}
      </div>
      <button
        onClick={() => onPay(order)}
        className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-sm shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all border border-emerald-200"
        disabled={order.isPaid}
      >
        <CreditCard size={20} className="inline mr-2" />
        {order.isPaid ? "Paid ✅" : "Pay Securely Now"}
      </button>
    </div>
  );
});

const QuickReplies = ({ onClick }) => {
  const replies = [
    { icon: Sparkles, label: "Top kurtis recommend करो ✨" },
    { icon: Package, label: "My recent orders 📦" },
    { icon: ShoppingBag, label: "New arrivals 👗" },
    { icon: ShoppingCart, label: "What's in my cart? 🛒" },
  ];

  return (
    <div className="px-4 py-3 bg-white/50 ar-glass border-t border-white/30 flex flex-nowrap gap-2.5 overflow-x-auto scrollbar-hide">
      {replies.map(({ icon: Icon, label }) => (
        <button
          key={label}
          onClick={() => onClick(label)}
          className="flex items-center gap-2 bg-white/80 hover:bg-white ar-glass backdrop-blur-sm text-violet-700 hover:text-violet-800 text-xs px-4 py-2.5 rounded-2xl border border-violet-200 hover:border-violet-400 hover:shadow-md whitespace-nowrap flex-shrink-0 hover:scale-[1.02] transition-all font-dm-sans font-medium"
        >
          <Icon size={16} />
          <span className="max-w-[120px] truncate">{label}</span>
        </button>
      ))}
    </div>
  );
};

const MessageBubble = ({ message, role }) => {
  const renderContent = () => {
    if (message.type === "products" && message.products?.length) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 pb-1">
          {message.products?.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onAdd={message.onAdd || (() => {})}
            />
          ))}
        </div>
      );
    }
    if (message.type === "order" && message.order) {
      return (
        <OrderCard order={message.order} onPay={message.onPay || (() => {})} />
      );
    }
    // Simple markdown: **bold**
    return message.content
      .split("\n")
      .map((line, i) => (
        <div
          key={i}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: line.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class=\"font-bold text-gray-900 dark:text-white\">$1</strong>',
            ),
          }}
        />
      ));
  };

  return (
    <div
      className={`p-0 ${role === "user" ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-xl" : "bg-white/80 ar-glass backdrop-blur-sm shadow-2xl border border-white/50 rounded-2xl rounded-tl-none"}`}
    >
      <div className="px-5 py-4">{renderContent()}</div>
    </div>
  );
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      role: "assistant",
      content:
        "Namaste! 👋 Aarohi यहाँ हूँ। Products recommend करूँ, orders track करूँ, या payment में help चाहिए?",
      type: "text",
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const formatTime = useCallback(
    (date) =>
      date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    [],
  );

  useEffect(() => {
    if (isOpen) {
      const savedKey = `aiChat_${user?._id || "guest"}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) setMessages(JSON.parse(saved));
      setUnreadCount(0);
    }
  }, [isOpen, user?._id]);

  useEffect(() => {
    const savedKey = `aiChat_${user?._id || "guest"}`;
    localStorage.setItem(savedKey, JSON.stringify(messages.slice(-50)));
  }, [messages, user?._id]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const toggleVoice = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser में voice support नहीं है। Chrome use करें।");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast("🎤 बोलिए...");
  }, [isListening]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      type: "text",
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");

    startTransition(async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          "http://localhost:3000/api/ai/chat",
          {
            question: currentInput,
            chatHistory: messages
              .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
              .join("\n\n"),
            userId: user?._id,
          },
          { timeout: 30000 },
        );

        const data = res.data.data || {
          reply: res.data.reply || "जी, समझ गयी! 😊",
        };

        const aiMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
          type: data.products?.length
            ? "products"
            : data.order
              ? "order"
              : "text",
          products: data.products || [],
          order: data.order || null,
          time: formatTime(new Date()),
          onAdd: handleAddToCart,
          onPay: handlePay,
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (aiMsg.order && !aiMsg.order.isPaid) {
          setPendingOrder(aiMsg.order);
          toast.success("💳 Payment ready! नीचे Pay Now दबाएं।");
        }
      } catch (error) {
        console.error("AI Chat Error:", error);
        const errorMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "क्षमा करें! कुछ गड़बड़ हो गयी। Page refresh करके try करें। 😅",
          type: "text",
          time: formatTime(new Date()),
        };
        setMessages((prev) => [...prev, errorMsg]);
        toast.error("AI connection issue. Check backend.");
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    });
  }, [
    input,
    messages,
    user?._id,
    addToCart,
    formatTime,
    loading,
    startTransition,
  ]);

  const handleAddToCart = useCallback(
    (product, qty = 1) => {
      addToCart(product, qty);
      toast.success(`✅ ${product.name} cart में add!`);
    },
    [addToCart],
  );

  const handlePay = useCallback((order) => {
    if (!order.isPaid) {
      setPendingOrder(order);
      setShowPaymentModal(true);
    }
  }, []);

  const handleQuickReply = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="ai-assistant fixed z-[9999] font-dm-sans">
        {/* FAB Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-16 h-16 sm:w-14 sm:h-14 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 ar-glow shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white/30"
        >
          <AarohiAvatar size={32} className="w-full h-full p-1" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-24 right-4 sm:right-8 w-80 sm:w-96 max-h-[70vh] bg-white/60 ar-glass backdrop-blur-xl shadow-2xl rounded-3xl border border-white/40 flex flex-col overflow-hidden sm:max-h-[650px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-5 py-4 flex items-center gap-4 shadow-xl">
              <AarohiAvatar size={32} />
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-bold text-lg truncate">
                  🧡 Aarohi
                </h2>
                <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-lg animate-ping" />
                  Online & Ready
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white/90 hover:text-white transition-all w-10 h-10 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-white/50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end gap-2" : "gap-3"}`}
                >
                  <div
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[90%]`}
                  >
                    <MessageBubble message={msg} role={msg.role} />
                    <p
                      className={`text-[11px] ${msg.role === "user" ? "text-violet-100 ml-2" : "text-gray-400"} mt-1.5 px-1 font-medium`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <AarohiAvatar size={28} className="mt-2 flex-shrink-0" />
                  <div className="bg-white/80 ar-glass p-5 border rounded-2xl rounded-tl-none shadow-xl max-w-[85%]">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <QuickReplies onClick={handleQuickReply} />

            {/* Input */}
            <div className="p-5 pt-0 bg-white/70 ar-glass border-t border-white/50">
              <div className="flex items-end bg-white/90 ar-glass border-2 border-violet-200 focus-within:border-violet-400 rounded-3xl p-3 transition-all hover:shadow-md">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Aarohi से बात करो..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder-violet-500 py-1 font-dm-sans resize-none max-h-16"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-2.5 rounded-2xl transition-all ml-2 flex-shrink-0 ${
                    isListening
                      ? "bg-red-100 text-red-500 hover:bg-red-200 shadow-md"
                      : "text-violet-500 hover:bg-violet-100 hover:text-violet-600"
                  }`}
                  disabled={loading}
                  title={isListening ? "Stop Listening" : "Voice Input"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="ml-2 w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl active:scale-95 transition-all flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPaymentModal && pendingOrder && (
        <PaymentModal
          orderId={pendingOrder._id}
          amount={pendingOrder.totalPrice}
          onSuccess={() => {
            toast.success("🎉 Payment successful! Order confirmed.");
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                role: "assistant",
                content:
                  "✅ Payment successful! आपका order processing में है 🚀",
                type: "text",
                time: formatTime(new Date()),
              },
            ]);
            setShowPaymentModal(false);
            setPendingOrder(null);
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingOrder(null);
          }}
        />
      )}
    </>
  );
};

export default AIAssistant;
