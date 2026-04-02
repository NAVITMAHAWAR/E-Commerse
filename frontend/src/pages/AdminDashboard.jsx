// AdminDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const StatCard = ({ title, value, icon, color = "indigo" }) => (
  <div
    className={`
      bg-white dark:bg-gray-800/90 backdrop-blur-sm
      rounded-2xl shadow-md border border-gray-100/80 dark:border-gray-700/60
      p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
    `}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide uppercase">
          {title}
        </p>
        <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div
        className={`text-4xl sm:text-5xl opacity-30 text-${color}-600 dark:text-${color}-500/40`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`
      bg-white dark:bg-gray-800/90 backdrop-blur-sm
      rounded-2xl shadow-md border border-gray-100/80 dark:border-gray-700/60
      p-5 sm:p-6 overflow-hidden ${className}
      transition-all duration-300 hover:shadow-xl
    `}
  >
    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-5 sm:mb-6">
      {title}
    </h3>
    <div className="h-64 sm:h-80">{children}</div>
  </div>
);

const CodAnalyticsCard = ({ analytics }) => {
  const hasCodData = analytics?.totalCODOrders > 0;

  return (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100/80 dark:border-gray-700/60 overflow-hidden">
      <div className="px-6 py-5 sm:px-7 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          COD Analytics
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {hasCodData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total COD Orders
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics.totalCODOrders.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                COD Revenue
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₹ {analytics.totalCODRevenue?.toLocaleString("en-IN") || "0"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Delivered COD
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {analytics.deliveredCOD?.toLocaleString("en-IN") || "0"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cancelled COD
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {analytics.cancelledCOD?.toLocaleString("en-IN") || "0"}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl sm:col-span-2 lg:col-span-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                COD Success Rate
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {analytics.codSuccessRate
                  ? `${analytics.codSuccessRate}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No COD orders recorded yet</p>
            <p className="mt-2 text-sm">
              COD statistics will appear here once Cash on Delivery orders are
              placed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/analytics");
        if (res.data?.success) {
          setAnalytics(res.data.data);
        } else {
          setError("API response was not successful");
        }
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="animate-spin h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950 p-4">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
            Oops!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {error || "No data available"}
          </p>
        </div>
      </div>
    );
  }

  const { overview, monthlyBreakdown } = analytics;
  const {
    totalOrders = 0,
    totalUsers = 0,
    totalRevenue = 0,
    paymentAnalytics = [],
  } = overview;

  const paymentChartData = {
    labels: paymentAnalytics.map((item) => item._id),
    datasets: [
      {
        label: "Revenue (₹)",
        data: paymentAnalytics.map((item) => item.totalRevenue),
        backgroundColor: [
          "rgba(59, 130, 246, 0.70)", // card
          "rgba(249, 115, 22, 0.70)", // COD
          "rgba(34, 197, 94, 0.70)", // UPI
        ],
        borderColor: [
          "rgb(59, 130, 246)",
          "rgb(249, 115, 22)",
          "rgb(34, 197, 94)",
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ₹ ${ctx.parsed.y.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(209, 213, 219, 0.3)" },
        ticks: {
          callback: (v) => `₹${v.toLocaleString("en-IN")}`,
          font: { size: 12 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 13 } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Last updated:{" "}
              {new Date(
                analytics.meta?.generatedAt || Date.now(),
              ).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹ ${totalRevenue.toLocaleString("en-IN")}`}
            icon="₹"
            color="indigo"
          />
          <StatCard
            title="Total Orders"
            value={totalOrders.toLocaleString("en-IN")}
            icon="📦"
            color="emerald"
          />
          <StatCard
            title="Total Users"
            value={totalUsers.toLocaleString("en-IN")}
            icon="👥"
            color="violet"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ChartCard title="Revenue by Payment Method">
            {paymentAnalytics.length > 0 ? (
              <Bar data={paymentChartData} options={chartOptions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-2">
                <svg
                  className="w-16 h-16 opacity-40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="font-medium">No payment data recorded yet</p>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Monthly Overview">
            {monthlyBreakdown?.length > 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Monthly chart will appear here when data is available
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-3">
                <svg
                  className="w-20 h-20 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="font-medium">Monthly breakdown is empty</p>
                <p className="text-sm">
                  Data will show here once orders are recorded over time
                </p>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Payment Methods Table */}
        {paymentAnalytics.length > 0 && (
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100/80 dark:border-gray-700/60 overflow-hidden">
            <div className="px-6 py-5 sm:px-7 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payment Methods Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50/80 dark:bg-gray-700/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-transparent">
                  {paymentAnalytics.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {item.totalOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ₹ {item.totalRevenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COD Analytics Section */}
        <CodAnalyticsCard analytics={overview} />
      </div>
    </div>
  );
};

export default AdminDashboard;
