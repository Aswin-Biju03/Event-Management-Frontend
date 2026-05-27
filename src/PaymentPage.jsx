import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookEventAPI } from "./services/allAPI";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract passed event state safely from navigation parameters
  const { event, userId } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");

  if (!event || !userId) {
    return <div className="text-red-400 text-center pt-24">Invalid payment checkout session parameters.</div>;
  }

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate an external payment gateway delay timer loop (1.5 seconds)
    setTimeout(() => {
      const payload = { eventId: event._id || event.id, userId };

      // 💥 ONLY HIT THE BOOKING REPOSITORY ON SUCCESSFUL PAYMENT SIMULATION
      bookEventAPI(payload)
        .then(() => {
          alert("💳 Payment Successful! Your gate pass has been issued.");
          navigate("/my-tickets"); // Route to tickets dashboard page link
        })
        .catch((err) => {
          console.error(err);
          alert(err?.response?.data?.message || "Payment processed but ticketing configuration failed.");
          setProcessing(false);
        });
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-2xl p-6 shadow-xl">
        
        {/* HEADER SUMMARY */}
        <div className="mb-6 pb-4 border-b border-border">
          <h1 className="text-xl font-bold text-white">Order Checkout Portal</h1>
          <p className="text-xs text-muted mt-1">Review transaction settlement criteria below</p>
        </div>

        {/* PRICE SUMMARY CARD */}
        <div className="bg-bg/50 border border-border rounded-xl p-4 mb-6 space-y-2">
          <p className="text-xs text-muted uppercase font-semibold tracking-wider">Item Details</p>
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium truncate pr-4 text-white">{event.title}</span>
            <span className="font-bold text-primary shrink-0">
              {event.price === 0 ? "₹0.00" : `₹${event.price}`}
            </span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-white">Total Amount Due</span>
            <span className="text-primary">{event.price === 0 ? "Free" : `₹${event.price}`}</span>
          </div>
        </div>

        {/* SIMULATED GATEWAY OPTIONS */}
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <label className="block text-xs text-muted font-bold uppercase tracking-wide">Select Payment Method</label>
          
          <div className="space-y-2">
            {[
              { id: "upi", name: "UPI (GPay / PhonePe / BHIM)" },
              { id: "card", name: "Credit / Debit Card Transaction" },
              { id: "net", name: "Net Banking Security Gateway" }
            ].map((method) => (
              <div 
                key={method.id}
                onClick={() => !processing && setPaymentMethod(method.id)}
                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                  paymentMethod === method.id ? "border-primary bg-primary/5 text-white" : "border-border hover:bg-surface-soft"
                }`}
              >
                <input 
                  type="radio" 
                  checked={paymentMethod === method.id} 
                  onChange={() => {}} 
                  disabled={processing}
                  className="accent-primary"
                />
                <span className="text-sm font-medium">{method.name}</span>
              </div>
            ))}
          </div>

          {/* ACTION BUTTON FOOTER UTILITIES */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              disabled={processing}
              onClick={() => navigate(-1)}
              className="w-1/3 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-surface-soft transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="w-2/3 py-2.5 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-soft transition flex items-center justify-center disabled:opacity-50"
            >
              {processing ? "Validating Secure Payment..." : `Pay ₹${event.price || 0} Now`}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}