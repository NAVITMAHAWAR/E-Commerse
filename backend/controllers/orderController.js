const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");
const razorpay = require("../services/razorpay");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const path = require("path"); // agar future mein font add karna ho to
const QRCode = require("qrcode");
const sendEmail = require("../services/email");

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: "no order items" });
    }

    // Convert product IDs to ObjectId
    const validatedOrderItems = orderItems.map((item) => ({
      ...item,
      product: new mongoose.Types.ObjectId(item.product),
    }));

    const newOrder = new Order({
      user: req.user._id,
      orderItems: validatedOrderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const createdOrder = await newOrder.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (order) res.json(order);
    else res.status(404).json({ message: "Order not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      ...order,
      orderId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Mark order as paid in DB
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: Date.now(),
        paymentResult: {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          status: "paid",
        },
      });
    }
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};
const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const customerName = order.user?.name || "Unknown Customer";
    const customerEmail = order.user?.email || "N/A";

    const subtotal = order.orderItems.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    );
    const extraCharges = order.totalPrice - subtotal;

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "portrait" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order._id}.pdf`,
    );

    doc.pipe(res);

    // Top Teal Header Bar
    doc.fillColor("#0D9488").rect(0, 0, doc.page.width, 100).fill();

    doc
      .fillColor("white")
      .fontSize(24)
      .text("Narendra's E-Shop", 50, 30)
      .fontSize(11)
      .text("Jaipur, Rajasthan, India", 50, 60)
      .text(`GSTIN: 27AAACM3025E1ZZ | +91-9664419721`, 50, 78);

    // INVOICE Title
    doc
      .fillColor("#111827")
      .fontSize(32)
      .text("INVOICE", 0, 130, { align: "center" })
      .moveDown(0.8)
      .lineWidth(3)
      .moveTo(80, doc.y)
      .lineTo(doc.page.width - 80, doc.y)
      .strokeColor("#FB923C")
      .stroke();

    // Order Details right
    doc
      .fontSize(11)
      .fillColor("#4B5563")
      .text(`Order ID: ${order._id}`, doc.page.width - 250, 170, {
        align: "right",
      })
      .text(
        `Date: ${
          order.createdAt
            ? new Date(order.createdAt).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A"
        }`,
        doc.page.width - 250,
        doc.y + 5,
        { align: "right" },
      );

    // Bill To
    doc.moveDown(4);
    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("Bill To:", 50, doc.y, { underline: true });
    doc
      .fontSize(12)
      .moveDown(0.5)
      .text(`Name: ${customerName}`, 50)
      .text(`Email: ${customerEmail}`, 50)
      .moveDown(0.8)
      .text(`Payment Method: ${order.paymentMethod || "N/A"}`, 50);

    // Items Table
    doc.moveDown(2);
    doc.fontSize(14).text("Items", 50, doc.y, { underline: true });
    doc.moveDown(0.6);

    const tableTop = doc.y;
    doc.fontSize(12).fillColor("#374151");

    // Header row orange
    doc
      .fillColor("#FB923C")
      .rect(40, tableTop - 5, 500, 25)
      .fill();
    doc
      .fillColor("white")
      .text("Product", 50, tableTop + 3)
      .text("Qty", 220, tableTop + 3, { width: 80, align: "center" })
      .text("Unit Price", 320, tableTop + 3, { width: 100, align: "right" })
      .text("Amount", 440, tableTop + 3, { width: 100, align: "right" });

    // Items rows
    let y = tableTop + 35;
    order.orderItems.forEach((item) => {
      const name = item.product?.name || "Product Not Found";
      const qty = item.qty || 0;
      const price = item.price || 0;
      const amt = qty * price;

      doc
        .fillColor("#111827")
        .text(name, 50, y, { width: 170 })
        .text(qty, 220, y, { width: 80, align: "center" })
        .text(`Rs.${price.toFixed(2)}`, 320, y, { width: 100, align: "right" })
        .text(`Rs.${amt.toFixed(2)}`, 440, y, { width: 100, align: "right" });

      y += 28;
    });

    // Summary
    doc.moveTo(300, y + 20);
    doc
      .fontSize(14)
      .fillColor("#111827")
      .text("Summary", 300, y + 20, { underline: true });
    y += 45;

    doc
      .fontSize(12)
      .text("Subtotal:", 300, y)
      .text(`Rs.${subtotal.toFixed(2)}`, 480, y, { align: "right" });

    if (extraCharges > 0) {
      y += 25;
      doc
        .text("Delivery / Tax / Other:", 300, y)
        .text(`Rs.${extraCharges.toFixed(2)}`, 480, y, { align: "right" });
    }

    y += 35;
    doc
      .fillColor("#FB923C")
      .rect(290, y - 10, 240, 40)
      .fill();
    doc
      .fillColor("white")
      .fontSize(16)
      .text("Grand Total:", 300, y)
      .text(`Rs.${order.totalPrice.toFixed(2)}`, 480, y, {
        align: "right",
        bold: true,
      });

    // ─── QR Code Addition ───
    const qrData = `upi://pay?pa=9664419721@ybl&pn=Narendra's E-Shop&am=${order.totalPrice.toFixed(2)}&cu=INR&tn=Payment for Order ${order._id}`;

    const qrBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 100,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    doc.image(qrBuffer, doc.page.width - 220, doc.page.height - 220, {
      width: 150,
      height: 150,
    });

    doc
      .fontSize(10)
      .fillColor("#4B5563")
      .text(
        "Scan to Pay / Track Order",
        doc.page.width - 220,
        doc.page.height - 60,
        {
          width: 150,
          align: "center",
        },
      );
    doc
      .fontSize(9)
      .fillColor("#4B5563")
      .text(
        "Amount: Rs." + order.totalPrice.toFixed(2),
        doc.page.width - 240,
        doc.page.height - 70,
        {
          width: 180,
          align: "center",
        },
      );

    // ─── Footer: Thank You + Terms (LEFT ALIGNED) ───
    const footerY = doc.page.height - 100; // Bottom se upar adjust kar sakte ho

    doc
      .fillColor("#4B5563")
      .fontSize(12)
      .text("Thank you for shopping with us!", 50, footerY)
      .text("We hope to see you again soon! 😊", 50, footerY + 18);

    doc
      .fontSize(10)
      .text(
        "Terms & Conditions: Payment due on delivery. Returns accepted within 7 days.",
        50,
        footerY + 45,
      );

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error.stack);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating invoice" });
    } else {
      res.end();
    }
  }
};

module.exports = {
  createOrder,
  getMyOrder,
  getOrderById,
  createRazorpayOrder,
  verifyPayment,
  generateInvoice,
};
