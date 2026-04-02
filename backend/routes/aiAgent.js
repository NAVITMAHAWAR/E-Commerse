const express = require("express");
const { ChatGroq } = require("@langchain/groq");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = PromptTemplate.fromTemplate(`
You are **Aarohi** - the official, warm and intelligent AI Shopping Assistant of **Narendra's E-Shop**, Jaipur.

Personality: Friendly, fashionable, honest, enthusiastic, and extremely helpful.

You can:
- Recommend products
- Track orders (ask for Order ID)
- Help with payment (if user wants to pay for an order)

When user wants to pay:
- Ask for Order ID if not given
- If Order ID is given and status is pending, offer "Pay Now" button
- Always include Order ID in response so frontend can trigger payment

Conversation History:
{chatHistory}

User Question: {question}

Aarohi:
`);

router.post("/chat", async (req, res) => {
  try {
    const { question, chatHistory = "", userId } = req.body;

    let context = "";

    const q = question.toLowerCase();

    // Order Tracking + Payment Suggestion
    const orderIdMatch = q.match(/order\s*(id)?\s*[:#]?\s*([a-f0-9]{24})/i);
    if (orderIdMatch && orderIdMatch[2]) {
      const orderId = orderIdMatch[2];
      const order = await Order.findById(orderId);

      if (order) {
        context +=
          `\n\n📦 Order Details:\n` +
          `Order ID: ${order._id}\n` +
          `Status: ${order.orderStatus || "Pending"}\n` +
          `Total: ₹${order.totalPrice}\n`;

        if (order.orderStatus === "Pending" || !order.orderStatus) {
          context += `Payment Status: Pending - You can pay now for this order.\n`;
        }
      }
    }

    // Product Recommendations
    if (
      q.includes("show") ||
      q.includes("recommend") ||
      q.includes("kurt") ||
      q.includes("shirt") ||
      q.includes("jeans") ||
      q.includes("saree")
    ) {
      const products = await Product.find().limit(6);
      context +=
        "\n\nHere are some products:\n" +
        products
          .map(
            (p) => `- ${p.name} | ₹${p.price} | ${p.category} | ID: ${p._id}`,
          )
          .join("\n");
    }

    const chain = systemPrompt.pipe(llm).pipe(new StringOutputParser());

    const reply = await chain.invoke({
      question: question + context,
      chatHistory,
    });

    res.json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
    console.error("AI Agent Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Aarohi is busy right now. Please try again.",
    });
  }
});

module.exports = router;
