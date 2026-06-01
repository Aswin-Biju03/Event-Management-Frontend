import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { bookEventAPI } from "./services/allAPI";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "upi",  label: "UPI",                 icon: "⚡" },
  { id: "net",  label: "Net Banking",          icon: "🏦" },
];

const BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

const CONVENIENCE_FEE = 20;
const MAX_TICKETS     = 10;

// ─── Formatters ──────────────────────────────────────────────────────────────

const formatCard   = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

// ─── Validators ──────────────────────────────────────────────────────────────

const validators = {
  card: ({ cardName, cardNum, expiry, cvv }) => {
    if (!cardName.trim())                          return { cardName: "Name is required" };
    const digits = cardNum.replace(/\s/g, "");
    if (digits.length < 16)                        return { cardNum: "Enter a valid 16-digit card number" };
    const [mm] = expiry.replace(/\s/g, "").split("/");
    if (!expiry || Number(mm) > 12 || Number(mm) < 1) return { expiry: "Enter a valid expiry (MM / YY)" };
    if (cvv.length < 3)                            return { cvv: "CVV must be 3 digits" };
    return null;
  },
  upi: ({ upiId }) => {
    if (!upiId.trim())                             return { upiId: "UPI ID is required" };
    if (!/^[\w.\-_]+@[\w]+$/.test(upiId.trim()))  return { upiId: "Invalid UPI ID format (e.g. name@upi)" };
    return null;
  },
  net: ({ bank }) => {
    if (!bank) return { bank: "Please select a bank" };
    return null;
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`input ${error ? "input-error" : ""}`}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PaymentPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { event, userId } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [method,     setMethod]     = useState("card");
  const [qty,        setQty]        = useState(1);
  const [errors,     setErrors]     = useState({});

  // Card
  const [cardName, setCardName] = useState("");
  const [cardNum,  setCardNum]  = useState("");
  const [expiry,   setExpiry]   = useState("");
  const [cvv,      setCvv]      = useState("");

  // UPI
  const [upiId, setUpiId] = useState("");

  // Net banking
  const [bank, setBank] = useState("");

  // ── Early exit ──
  if (!event || !userId) {
    return (
      <div className="page-center">
        <p className="error-state">⚠️ Invalid checkout session.</p>
        <button className="btn-ghost" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const price = event.price || 0;
  const fee   = price > 0 ? CONVENIENCE_FEE : 0;
  const total = price * qty + fee;

  // ── Validation ──
  const validate = useCallback(() => {
    const fieldValues = { cardName, cardNum, expiry, cvv, upiId, bank };
    return validators[method]?.(fieldValues) ?? null;
  }, [method, cardName, cardNum, expiry, cvv, upiId, bank]);

  // ── Submit ──
  const handleSubmit = () => {
    const errs = validate();
    if (errs) { setErrors(errs); return; }
    setErrors({});
    setProcessing(true);

    setTimeout(() => {
      bookEventAPI({ eventId: event._id || event.id, userId, quantity: qty })
        .then(() => {
          alert("💳 Payment successful! Your gate pass has been issued.");
          navigate("/my-tickets");
        })
        .catch((err) => {
          alert(err?.response?.data?.message || "Booking failed. Please try again.");
          setProcessing(false);
        });
    }, 1500);
  };

  const clearError = (key) => setErrors((e) => { const n = { ...e }; delete n[key]; return n; });

  return (
    <>
      {/* ── Scoped styles ── */}
      <style>{`
        :root {
          --bg:        #0d0f14;
          --surface:   #161a24;
          --surface2:  #1e2330;
          --border:    #2a2f3e;
          --primary:   #7c6aff;
          --primary-h: #9b8dff;
          --text:      #e8eaf0;
          --muted:     #6b7280;
          --error:     #f87171;
          --success:   #34d399;
          --radius:    12px;
          --font:      'DM Sans', system-ui, sans-serif;
        }

        .pay-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 96px 16px 48px;
          font-family: var(--font);
          color: var(--text);
        }

        .pay-card {
          width: 100%;
          max-width: 460px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 28px 24px;
          box-shadow: 0 24px 60px rgba(0,0,0,.5);
        }

        /* Header */
        .pay-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .pay-eyebrow { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .pay-title { font-size: 20px; font-weight: 700; color: var(--text); }

        /* Divider */
        .divider { height: 1px; background: var(--border); margin: 20px 0; }

        /* Order summary */
        .summary {
          background: rgba(255,255,255,.03);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 14px 16px;
          margin-bottom: 20px;
          font-size: 13.5px;
        }
        .summary-row { display: flex; justify-content: space-between; color: var(--muted); margin-bottom: 6px; }
        .summary-row:last-child { margin-bottom: 0; }
        .summary-total { color: var(--text); font-weight: 700; font-size: 15px; padding-top: 8px; border-top: 1px solid var(--border); }

        /* Quantity */
        .section-label { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .qty-row { display: flex; align-items: center; gap: 10px; }
        .qty-btn {
          width: 34px; height: 34px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface2);
          color: var(--text);
          font-size: 18px; line-height: 1;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          display: flex; align-items: center; justify-content: center;
        }
        .qty-btn:hover:not(:disabled) { border-color: var(--primary); background: rgba(124,106,255,.1); }
        .qty-btn:disabled { opacity: .35; cursor: not-allowed; }
        .qty-value { font-size: 16px; font-weight: 700; min-width: 20px; text-align: center; }
        .qty-hint { font-size: 12px; color: var(--muted); }

        /* Payment methods */
        .method-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .method-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--muted);
          font-size: 13.5px; font-family: var(--font);
          cursor: pointer;
          transition: border-color .15s, background .15s, color .15s;
          text-align: left;
        }
        .method-btn:hover { border-color: rgba(124,106,255,.5); color: var(--text); }
        .method-btn.active { border-color: var(--primary); color: var(--text); background: rgba(124,106,255,.07); }
        .method-btn .method-dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid var(--border);
          margin-left: auto;
          transition: border-color .15s, background .15s;
          flex-shrink: 0;
        }
        .method-btn.active .method-dot { border-color: var(--primary); background: var(--primary); }

        /* Fields */
        .fields { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label { font-size: 12px; color: var(--muted); font-weight: 500; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field-error { font-size: 11.5px; color: var(--error); }

        .input {
          width: 100%; padding: 10px 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 9px;
          color: var(--text);
          font-size: 14px; font-family: var(--font);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .input::placeholder { color: var(--muted); opacity: .6; }
        .input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(124,106,255,.15); }
        .input-error { border-color: var(--error) !important; }
        .input-error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,.15) !important; }

        select.input { appearance: none; cursor: pointer; }
        select.input option { background: var(--surface); }

        /* Actions */
        .actions { display: flex; gap: 10px; }
        .btn-cancel {
          flex: 0 0 auto; width: 90px; padding: 11px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--muted);
          font-size: 13.5px; font-family: var(--font);
          cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .btn-cancel:hover:not(:disabled) { border-color: var(--text); color: var(--text); }
        .btn-cancel:disabled { opacity: .4; cursor: not-allowed; }

        .btn-pay {
          flex: 1; padding: 11px;
          border: none; border-radius: var(--radius);
          background: var(--primary);
          color: #fff;
          font-size: 14px; font-weight: 700; font-family: var(--font);
          cursor: pointer;
          transition: background .15s, transform .1s, opacity .15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
        }
        .btn-pay:hover:not(:disabled) { background: var(--primary-h); }
        .btn-pay:active:not(:disabled) { transform: scale(.98); }
        .btn-pay:disabled { opacity: .5; cursor: not-allowed; }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
          display: inline-block;
        }

        /* Error / center page */
        .page-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; font-family: var(--font); }
        .error-state { color: var(--error); font-size: 15px; }
        .btn-ghost { padding: 8px 20px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-family: var(--font); cursor: pointer; }

        /* Free badge */
        .badge-free {
          display: inline-block; padding: 2px 8px;
          border-radius: 99px; font-size: 11px; font-weight: 700;
          background: rgba(52,211,153,.12); color: var(--success);
          border: 1px solid rgba(52,211,153,.25);
        }
      `}</style>

      <div className="pay-page">
        <div className="pay-card">

          {/* Header */}
          <div className="pay-header">
            <p className="pay-eyebrow">Secure Checkout</p>
            <h1 className="pay-title">Complete your booking</h1>
          </div>

          {/* Order Summary */}
          <div className="summary">
            <div className="summary-row">
              <span>{event.title}</span>
              <span>{price > 0 ? `₹${price} × ${qty}` : <span className="badge-free">FREE</span>}</span>
            </div>
            {fee > 0 && (
              <div className="summary-row">
                <span>Convenience fee</span>
                <span>₹{fee}</span>
              </div>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{total > 0 ? `₹${total}` : "Free"}</span>
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 20 }}>
            <p className="section-label">Number of tickets</p>
            <div className="qty-row">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(MAX_TICKETS, q + 1))} disabled={qty >= MAX_TICKETS}>+</button>
              <span className="qty-hint">{qty === MAX_TICKETS ? "Maximum reached" : `Up to ${MAX_TICKETS} per booking`}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Payment Methods */}
          <div style={{ marginBottom: 16 }}>
            <p className="section-label">Payment method</p>
            <div className="method-list">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`method-btn ${method === m.id ? "active" : ""}`}
                  onClick={() => { setMethod(m.id); setErrors({}); }}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                  <span className="method-dot" />
                </button>
              ))}
            </div>
          </div>

          {/* Card Fields */}
          {method === "card" && (
            <div className="fields">
              <Field label="Name on card" error={errors.cardName}>
                <Input
                  placeholder="John Doe"
                  value={cardName}
                  error={errors.cardName}
                  onChange={e => { setCardName(e.target.value); clearError("cardName"); }}
                />
              </Field>
              <Field label="Card number" error={errors.cardNum}>
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={cardNum}
                  error={errors.cardNum}
                  inputMode="numeric"
                  onChange={e => { setCardNum(formatCard(e.target.value)); clearError("cardNum"); }}
                />
              </Field>
              <div className="field-row">
                <Field label="Expiry" error={errors.expiry}>
                  <Input
                    placeholder="MM / YY"
                    value={expiry}
                    error={errors.expiry}
                    inputMode="numeric"
                    onChange={e => { setExpiry(formatExpiry(e.target.value)); clearError("expiry"); }}
                  />
                </Field>
                <Field label="CVV" error={errors.cvv}>
                  <Input
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    value={cvv}
                    error={errors.cvv}
                    inputMode="numeric"
                    onChange={e => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); clearError("cvv"); }}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* UPI Fields */}
          {method === "upi" && (
            <div className="fields">
              <Field label="UPI ID" error={errors.upiId}>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  error={errors.upiId}
                  onChange={e => { setUpiId(e.target.value); clearError("upiId"); }}
                />
              </Field>
            </div>
          )}

          {/* Net Banking Fields */}
          {method === "net" && (
            <div className="fields">
              <Field label="Select your bank" error={errors.bank}>
                <select
                  className={`input ${errors.bank ? "input-error" : ""}`}
                  value={bank}
                  onChange={e => { setBank(e.target.value); clearError("bank"); }}
                >
                  <option value="">Choose bank…</option>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Actions */}
          <div className="actions">
            <button className="btn-cancel" onClick={() => navigate(-1)} disabled={processing}>
              Cancel
            </button>
            <button className="btn-pay" onClick={handleSubmit} disabled={processing}>
              {processing
                ? <><span className="spinner" /> Processing…</>
                : `Pay ${total > 0 ? `₹${total}` : "Free"}`}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}