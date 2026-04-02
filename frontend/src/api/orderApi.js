import api from "./axios";

export const getMyOrders = async () => {
  const { data } = await api.get("/orders/my");
  return data;
};

export const downloadInvoice = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: "blob", // Important for handling PDF response
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading invoice:", error);

    if (error.response?.status === 401) {
      throw new Error("Unauthorized - Please login again");
    }

    throw error;
  }
};
