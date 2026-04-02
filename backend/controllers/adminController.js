const Order = require("../models/Order");
const User = require("../models/User");

const getAnalytics = async (req, res) => {
  try {
    // 1. Basic counts (fast with countDocuments)
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    // 2. Paid orders for revenue (lean() for performance - no Mongoose overhead)
    const paidOrders = await Order.find({ isPaid: true })
      .select("totalPrice") // sirf zaroori field
      .lean(); // faster query (plain JS objects)

    // 3. Total revenue (safe reduce with fallback 0)
    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + (order.totalPrice || 0),
      0,
    );

    // 4. Monthly breakdown (aggregation - efficient)
    const monthlyData = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $exists: true }, // safety
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // 1 = Jan, 2 = Feb, ...
          revenue: { $sum: "$totalPrice" },
          ordersCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // January se December tak
      },
      {
        $project: {
          month: "$_id",
          revenue: 1,
          ordersCount: 1,
          _id: 0, // _id remove kar do
        },
      },
    ]);

    // Payment Method Analytics
    const paymentAnalytics = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // COD Specific Analytics
    const codOrders = await Order.find({ paymentMethod: "COD" });

    const totalCODOrders = codOrders.length;

    const totalCODRevenue = codOrders
      .filter((order) => order.isPaid)
      .reduce((acc, order) => acc + order.totalPrice, 0);

    const deliveredCOD = codOrders.filter((order) => order.isDelivered).length;

    const cancelledCOD = codOrders.filter(
      (order) => order.status === "Cancelled",
    ).length;

    const codSuccessRate =
      totalCODOrders > 0
        ? ((deliveredCOD / totalCODOrders) * 100).toFixed(2)
        : 0;

    // 5. Optional: Current year filter agar chahiye (uncomment if needed)
    // const currentYear = new Date().getFullYear();
    // $match: { createdAt: { $gte: new Date(currentYear, 0, 1) } }

    // 6. Response structure (frontend ke liye clean)
    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalUsers,
          totalRevenue: Math.round(totalRevenue), // decimal cleanup if needed
          paymentAnalytics,
          totalOrders,
          totalUsers,
          totalRevenue,
          monthlyData,
          paymentAnalytics,
          totalCODOrders,
          totalCODRevenue,
          deliveredCOD,
          cancelledCOD,
          codSuccessRate,
        },
        monthlyBreakdown: monthlyData,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        // optional: cache info future mein add kar sakte ho
      },
    });
  } catch (error) {
    console.error("Analytics fetch failed:", {
      message: error.message,
      stack: error.stack, // production mein stack mat bhejo, sirf dev mein
    });

    // Production mein detailed error mat bhejo client ko
    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch analytics at this time. Please try again later.",
    });
  }
};

module.exports = { getAnalytics };
