import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookEventAPI } from "./services/allAPI";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, userId } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState("card");
  const [qty, setQty] = useState(1);

  // Card fields
  const [cardName, setCardName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // UPI
  const [upiId, setUpiId] = useState("");

  // Net banking
  const [bank, setBank] = useState("");

  if (!event || !userId) {
    return <div className="text-red-400 text-center pt-24">Invalid checkout session.</div>;
  }

  const price = event.price || 0;
  const fee = price > 0 ? 20 : 0;
  const total = price * qty + fee;

  const formatCard = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, "").slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + " / " + v.slice(2) : v;
  };

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => {
      bookEventAPI({ eventId: event._id || event.id, userId, quantity: qty })
        .then(() => {
          alert("💳 Payment successful! Your gate pass has been issued.");
          navigate("/my-tickets");
        })
        .catch((err) => {
          alert(err?.response?.data?.message || "Booking failed.");
          setProcessing(false);
        });
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-2xl p-6 shadow-xl">

        <div className="mb-5 pb-4 border-b border-border">
          <p className="text-xs text-muted mb-0.5">Checkout</p>
          <h1 className="text-xl font-semibold text-white">Complete your booking</h1>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-bg/50 border border-border rounded-xl p-4 mb-5 space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>{event.title}</span>
            <span>₹{price} × {qty}</span>
          </div>
          {fee > 0 && <div className="flex justify-between text-muted"><span>Convenience fee</span><span>₹{fee}</span></div>}
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between font-semibold text-white">
            <span>Total</span><span>₹{total}</span>
          </div>
        </div>

        {/* QUANTITY */}
        <div className="mb-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Tickets</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 border border-border rounded-lg bg-surface text-white flex items-center justify-center hover:bg-surface-soft transition">−</button>
            <span className="text-base font-semibold text-white w-5 text-center">{qty}</span>
            <button onClick={() => setQty(q => Math.min(10, q + 1))}
              className="w-8 h-8 border border-border rounded-lg bg-surface text-white flex items-center justify-center hover:bg-surface-soft transition">+</button>
            <span className="text-xs text-muted ml-1">person(s)</span>
          </div>
        </div>

        <div className="h-px bg-border mb-5" />

        {/* METHOD SELECT */}
        <div className="mb-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Payment method</p>
          <div className="flex flex-col gap-2">
            {[
              { id: "card", label: "Credit / Debit card" },
              { id: "upi", label: "UPI" },
              { id: "net", label: "Net banking" },
            ].map((m) => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm transition text-left
                  ${method === m.id ? "border-primary text-white bg-primary/5" : "border-border text-muted hover:bg-surface-soft"}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* CARD FIELDS */}
        {method === "card" && (
          <div className="space-y-3 mb-5">
            <div className="h-px bg-border mb-4" />
            <div>
              <label className="text-xs text-muted block mb-1.5">Name on card</label>
              <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Rahul Sharma"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Card number</label>
              <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">Expiry</label>
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" maxLength={7}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">CVV</label>
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" type="password" maxLength={4}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
              </div>
            </div>
          </div>
        )}

        {/* UPI FIELDS */}
        {method === "upi" && (
          <div className="mb-5">
            <div className="h-px bg-border mb-4" />
            <label className="text-xs text-muted block mb-1.5">UPI ID</label>
            <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition" />
          </div>
        )}

        {/* NET BANKING FIELDS */}
        {method === "net" && (
          <div className="mb-5">
            <div className="h-px bg-border mb-4" />
            <label className="text-xs text-muted block mb-1.5">Select bank</label>
            <select value={bank} onChange={e => setBank(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition">
              <option value="">Choose bank...</option>
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
            </select>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} disabled={processing}
            className="w-1/3 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-surface-soft transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={processing}
            className="w-2/3 py-2.5 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-soft transition flex items-center justify-center disabled:opacity-50">
            {processing ? "Processing..." : `Pay ₹${total}`}
          </button>
        </div>

      </div>
    </div>
  );
}