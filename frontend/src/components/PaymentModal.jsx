import React from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentModal = ({ orderId, amount, onSuccess, onClose }) => {
  const handlePayment = async () => {
    try {
      // Step 1: Create Razorpay Order
      const { data } = await axios.post(
        "http://localhost:3000/api/payment/create-order",
        {
          amount,
          receipt: `order_${orderId}`,
        },
      );

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Narendra's E-Shop",
        description: `Payment for Order #${orderId}`,
        order_id: data.orderId,
        handler: async function (response) {
          // Step 2: Verify Payment
          const verifyRes = await axios.post(
            "http://localhost:3000/api/payment/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            },
          );

          if (verifyRes.data.success) {
            toast.success("Payment Successful! 🎉");
            onSuccess();
            onClose();
          }
        },
        prefill: {
          name: "Narendra",
          email: "narendra@example.com",
          contact: "9664419721",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Payment initiation failed");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Payment
        </h2>

        <div className="bg-gray-50 p-6 rounded-xl mb-6">
          <p className="text-gray-600">Order Amount</p>
          <p className="text-4xl font-bold text-violet-600">₹{amount}</p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all"
        >
          Pay Now with Razorpay
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 py-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
