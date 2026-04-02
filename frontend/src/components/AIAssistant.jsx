import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Mic, MicOff, ShoppingCart, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import PaymentModal from './PaymentModal';   // ← Yeh bana lena

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! 👋 I'm Aarohi, your personal fashion assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingAmount, setPendingAmount] = useState(0);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Input (same as before)
  // ... (voice code same rakh sakte ho)

  const sendMessage = async (voiceText = null) => {
    const messageText = voiceText || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const userInfo = localStorage.getItem("userInfo");
      const user = userInfo ? JSON.parse(userInfo) : null;

      const res = await axios.post('http://localhost:3000/api/ai/chat', {
        question: messageText,
        chatHistory: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
        userId: user?._id
      });

      const aiReply = res.data.reply;

      // Extract Order ID for Payment
      const orderIdMatch = aiReply.match(/Order ID:\s*([a-f0-9]{24})/i);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;

      // Extract Amount if mentioned
      const amountMatch = aiReply.match(/₹(\d+)/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: aiReply,
        orderId,
        amount
      }]);


      
      // Agar AI ne payment suggest kiya to modal ready rakho
      if (orderId && amount > 0) {
        setPendingOrderId(orderId);
        setPendingAmount(amount);
      }

    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble responding right now." 
      }]);
    } finally {
      setLoading(false);
    }
    
  };

  const handlePayNow = () => {
    if (pendingOrderId && pendingAmount > 0) {
      setShowPaymentModal(true);
    } else {
      toast.error("No pending payment found");
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 z-50"
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[440px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Aarohi</p>
              <p className="text-xs opacity-90">Your Smart Assistant</p>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto bg-gray-50 space-y-4 min-h-[420px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl ${
                  msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white border'
                }`}>
                  {msg.content}

                  {/* Pay Now Button */}
                  {msg.role === 'assistant' && msg.orderId && msg.amount && (
                    <button
                      onClick={handlePayNow}
                      className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2"
                    >
                      <CreditCard size={18} />
                      Pay Now ₹{msg.amount}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-500">Aarohi is thinking...</div>}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Track order ya payment karna hai?"
                className="flex-1 border rounded-full px-5 py-3"
              />
              <button onClick={() => sendMessage()} className="bg-violet-600 text-white p-3 rounded-full">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal 
          orderId={pendingOrderId} 
          amount={pendingAmount} 
          onSuccess={() => {
            toast.success("Payment Successful!");
            setShowPaymentModal(false);
          }}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
};

export default AIAssistant;