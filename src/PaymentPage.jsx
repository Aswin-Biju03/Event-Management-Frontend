import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookEventAPI } from "./services/allAPI";

const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank"];
const CONVENIENCE_FEE = 20;
const MAX_TICKETS = 10;

const formatCard   = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d; };

const validate = (method, fields) => {
  const { cardName, cardNum, expiry, cvv, upiId, bank } = fields;
  if (method === "card") {
    if (!cardName.trim())                            return { cardName: "Name is required" };
    if (!/^[a-zA-Z\s'-]+$/.test(cardName.trim()))   return { cardName: "Name must contain letters only" };
    if (cardNum.replace(/\s/g, "").length < 16)      return { cardNum: "Enter a valid 16-digit card number" };
    const [mm] = expiry.replace(/\s/g, "").split("/");
    if (!expiry || Number(mm) < 1 || Number(mm) > 12) return { expiry: "Enter a valid expiry (MM / YY)" };
    if (cvv.length < 3)                              return { cvv: "CVV must be 3 digits" };
  }
  if (method === "upi") {
    if (!upiId.trim())                               return { upiId: "UPI ID is required" };
    if (!/^[\w.\-_]+@[\w]+$/.test(upiId.trim()))    return { upiId: "Invalid UPI ID (e.g. name@upi)" };
  }
  if (method === "net" && !bank)                     return { bank: "Please select a bank" };
  return null;
};

const inputCls = (err) =>
  `w-full px-3 py-2.5 rounded-lg bg-surface2 border text-sm text-text placeholder:text-muted/50 outline-none focus:ring-2 transition
  ${err ? "border-red-500 focus:ring-red-500/20" : "border-border focus:border-primary focus:ring-primary/20"}`;

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { event, userId } = state || {};

  const [method,     setMethod]     = useState("card");
  const [qty,        setQty]        = useState(1);
  const [processing, setProcessing] = useState(false);
  const [errors,     setErrors]     = useState({});

  const [cardName, setCardName] = useState("");
  const [cardNum,  setCardNum]  = useState("");
  const [expiry,   setExpiry]   = useState("");
  const [cvv,      setCvv]      = useState("");
  const [upiId,    setUpiId]    = useState("");
  const [bank,     setBank]     = useState("");

  if (!event || !userId) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-bg text-text">
      <p className="text-red-400">⚠️ Invalid checkout session.</p>
      <button onClick={() => navigate("/")} className="px-4 py-2 border border-border rounded-lg text-sm">Go Home</button>
    </div>
  );

  const price = event.price || 0;
  const fee   = price > 0 ? CONVENIENCE_FEE : 0;
  const total = price * qty + fee;
  const clearErr = (k) => setErrors(e => { const n = { ...e }; delete n[k]; return n; });

  const handleSubmit = () => {
    const errs = validate(method, { cardName, cardNum, expiry, cvv, upiId, bank });
    if (errs) { setErrors(errs); return; }
    setErrors({});
    setProcessing(true);
    setTimeout(() => {
      bookEventAPI({ eventId: event._id || event.id, userId, quantity: qty })
        .then(() => { alert("💳 Payment successful! Your gate pass has been issued."); navigate("/my-tickets"); })
        .catch((err) => { alert(err?.response?.data?.message || "Booking failed."); setProcessing(false); });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg text-text flex justify-center items-start px-4 pt-24 pb-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-xl">

        {/* Header */}
        <div className="mb-5 pb-4 border-b border-border">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-1">Secure Checkout</p>
          <h1 className="text-xl font-bold">Complete your booking</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-white/[0.03] border border-border rounded-xl p-4 mb-5 text-sm space-y-1.5">
          <div className="flex justify-between text-muted">
            <span>{event.title}</span>
            <span>{price > 0 ? `₹${price} × ${qty}` : <span className="text-green-400 text-xs font-semibold">FREE</span>}</span>
          </div>
          {fee > 0 && <div className="flex justify-between text-muted"><span>Convenience fee</span><span>₹{fee}</span></div>}
          <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
            <span>Total</span><span>{total > 0 ? `₹${total}` : "Free"}</span>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">Tickets</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
              className="w-8 h-8 border border-border rounded-lg bg-surface2 text-lg disabled:opacity-30">−</button>
            <span className="font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty(q => Math.min(MAX_TICKETS, q + 1))} disabled={qty >= MAX_TICKETS}
              className="w-8 h-8 border border-border rounded-lg bg-surface2 text-lg disabled:opacity-30">+</button>
            <span className="text-xs text-muted">{qty === MAX_TICKETS ? "Maximum reached" : `Up to ${MAX_TICKETS}`}</span>
          </div>
        </div>

        <div className="border-t border-border mb-5" />

        {/* Payment Methods */}
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">Payment method</p>
          <div className="flex flex-col gap-2">
            {[{ id: "card", label: "Credit / Debit Card" }, { id: "upi", label: "UPI" }, { id: "net", label: "Net Banking" }].map(m => (
              <button key={m.id} onClick={() => { setMethod(m.id); setErrors({}); }}
                className={`px-4 py-2.5 rounded-xl border text-sm text-left transition
                  ${method === m.id ? "border-primary text-text bg-primary/5" : "border-border text-muted hover:border-primary/40"}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Fields */}
        {method === "card" && (
          <div className="space-y-3 mb-5">
            <div>
              <input placeholder="Name on card" value={cardName} className={inputCls(errors.cardName)}
                onChange={e => { setCardName(e.target.value); clearErr("cardName"); }} />
              {errors.cardName && <p className="text-red-400 text-xs mt-1">{errors.cardName}</p>}
            </div>
            <div>
              <input placeholder="0000 0000 0000 0000" value={cardNum} inputMode="numeric" className={inputCls(errors.cardNum)}
                onChange={e => { setCardNum(formatCard(e.target.value)); clearErr("cardNum"); }} />
              {errors.cardNum && <p className="text-red-400 text-xs mt-1">{errors.cardNum}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input placeholder="MM / YY" value={expiry} inputMode="numeric" className={inputCls(errors.expiry)}
                  onChange={e => { setExpiry(formatExpiry(e.target.value)); clearErr("expiry"); }} />
                {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
              </div>
              <div>
                <input placeholder="CVV" type="password" maxLength={4} value={cvv} inputMode="numeric" className={inputCls(errors.cvv)}
                  onChange={e => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); clearErr("cvv"); }} />
                {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}

        {/* UPI */}
        {method === "upi" && (
          <div className="mb-5">
            <input placeholder="yourname@upi" value={upiId} className={inputCls(errors.upiId)}
              onChange={e => { setUpiId(e.target.value); clearErr("upiId"); }} />
            {errors.upiId && <p className="text-red-400 text-xs mt-1">{errors.upiId}</p>}
          </div>
        )}

        {/* Net Banking */}
        {method === "net" && (
          <div className="mb-5">
            <select value={bank} className={inputCls(errors.bank)}
              onChange={e => { setBank(e.target.value); clearErr("bank"); }}>
              <option value="">Choose bank…</option>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
            {errors.bank && <p className="text-red-400 text-xs mt-1">{errors.bank}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} disabled={processing}
            className="w-24 py-2.5 border border-border rounded-xl text-sm text-muted hover:text-text hover:border-text/40 disabled:opacity-40 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={processing}
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition flex items-center justify-center gap-2">
            {processing
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
              : `Pay ${total > 0 ? `₹${total}` : "Free"}`}
          </button>
        </div>

      </div>
    </div>
  );
}