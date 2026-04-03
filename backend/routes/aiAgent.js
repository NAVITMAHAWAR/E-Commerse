const express = require("express");
const { ChatGroq } = require("@langchain/groq");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const Product = require("../models/Product");
const Order = require("../models/Order");
const zod = require("zod");

const router = express.Router();

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3, // Lower for consistency
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = PromptTemplate.fromTemplate(`
You are **Aarohi** - warm, stylish AI Shopping Assistant for **Narendra's E-Shop**, Jaipur.

Friendly, helpful, fashion-savvy.

Capabilities:
- Recommend products using PRODUCT_ID:xxxxx format (e.g. PRODUCT_ID:507f1f77bcf86cd799439011)
- Track orders using ORDER_ID:xxxxx format
- Suggest outfits, categories from context

Use ALL context. Concise replies, emojis, natural Hindi-English.

Payments: Pending? Mention "Pay now ORDER_ID:xxxxx"

Context:
{context}

History:
{chatHistory}

User: {question}

Aarohi:
`);

router.post("/chat", async (req, res) => {
  try {
    const { question, chatHistory = "", userId } = req.body;

    // Helper for order status
    const getOrderStatus = (order) => {
      if (!order.isPaid) return "Pending";
      if (order.isDelivered) return "Delivered";
      return "Processing";
    };

    let context = "";

    const q = question.toLowerCase();

    // User recent orders
    if (userId) {
      const recentOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("_id totalPrice isPaid isDelivered");
      if (recentOrders.length) {
        context += `\nRecent orders: `;
        recentOrders.forEach((o) => {
          context += ` #${o._id.slice(-6)} (₹${o.totalPrice}, ${getOrderStatus(o)})`;
        });
        context += `\n`;
      }
    }

    // Specific order lookup
    const orderIdMatch = q.match(/order\\s*(id)?\\s*[:#]?\\s*([a-f0-9]{24})/i);
    if (orderIdMatch && orderIdMatch[2]) {
      const orderId = orderIdMatch[2];
      const order = await Order.findById(orderId).populate(
        "orderItems.product",
        "name price",
      );
      if (order) {
        const status = getOrderStatus(order);
        context += `\nOrder ${order._id.slice(-6)}: ${status}, ₹${order.totalPrice}`;
        if (!order.isPaid) {
          context += ` - PENDING PAYMENT. Use ORDER_ID:${order._id}`;
        }
        context += `\n`;
      }
    }

    // Smart product recs
    const recTriggers = [
      "recommend",
      "show",
      "suggest",
      "kurt",
      "shirt",
      "jeans",
      "saree",
      "dress",
    ];
    if (recTriggers.some((t) => q.includes(t))) {
      let filter = {};
      const catMatch = q.match(/kurt|shirt|jeans|saree|dress|tshirt/i);
      if (catMatch) filter.category = { $regex: catMatch[0], $options: "i" };
      const products = await Product.find(filter)
        .sort({ rating: -1, createdAt: -1 })
        .limit(6)
        .select("name price category image rating _id");
      if (products.length) {
        context += `\nRecommendations:\n`;
        products.forEach((p) => {
          context += `${p.name} (₹${p.price}, ${p.category}) PRODUCT_ID:${p._id} IMG:${p.image}\\n`;
        });
      }
    }

    const chain = systemPrompt.pipe(llm).pipe(new StringOutputParser());

    const reply = await chain.invoke({
      question,
      context,
      chatHistory,
    });

    // Parse for structured data
    const data = {
      reply: reply.trim(),
      products: [],
      order: null,
    };

    // Extract products
    const prodMatches = reply.match(/PRODUCT_ID:([a-f0-9]{24})/g);
    if (prodMatches) {
      const ids = [
        ...new Set(prodMatches.map((m) => m.replace("PRODUCT_ID:", ""))),
      ];
      data.products = await Product.find({ _id: { $in: ids } });
    }

    // Extract order
    const orderMatch = reply.match(/ORDER_ID:([a-f0-9]{24})/);
    if (orderMatch) {
      data.order = await Order.findById(orderMatch[1]);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("AI Agent Error:", error);
    res.status(500).json({
      success: false,
      reply: "Oops! Aarohi is thinking. Try again? 😊",
    });
  }
});

module.exports = router;
