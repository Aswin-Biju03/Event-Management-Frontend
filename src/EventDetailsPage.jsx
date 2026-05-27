import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventByIdAPI } from "./services/allAPI";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Recover logged-in user profile attributes from browser storage session context
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // 2. Fetch target event catalog metrics by structural URI parameter parameters
    getEventByIdAPI(id)
      .then((res) => {
        setEvent(res?.data || res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load event spec profiles:", err);
        setError("Failed to load event details.");
        setLoading(false);
      });
  }, [id]);

  // 3. Instead of direct backend writing, bypass flow constraints to the payment verification gateway
  const handleProceedToPayment = () => {
    if (!user) {
      alert("Please login first to purchase event passes.");
      return;
    }

    // Forward transaction context requirements safely to checkout routing targets
    navigate("/checkout-payment", {
      state: {
        event: event,
        userId: user._id,
      },
    });
  };

  if (loading) return <div className="text-white text-center pt-24">Loading event catalog spec configurations...</div>;
  if (error || !event) return <div className="text-red-400 text-center pt-24">{error || "Event not found inside dataset records."}</div>;

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl overflow-hidden p-6 shadow-xl">
        
        {/* BANNER BRAND BLOCK LAYOUT */}
        <div className="text-center pb-6 border-b border-border">
          <span className="text-6xl block mb-2">{event.emoji || "📅"}</span>
          <h1 className="text-3xl font-bold text-white">{event.title || "Untitled Event Pass"}</h1>
          {event.category && (
            <span className="inline-block bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full border border-primary/20 mt-2">
              {event.category}
            </span>
          )}
        </div>

        {/* LOGISTICS MATRIX PROPERTY CARD METADATA */}
        <div className="py-6 space-y-4 text-sm border-b border-border">
          <p className="flex items-center gap-2">
            <span className="text-base">📍</span> 
            <span className="font-semibold text-text">Venue Location:</span> 
            <span className="text-muted">{event.location || event.venue || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-base">📅</span> 
            <span className="font-semibold text-text">Date & Entry Time:</span> 
            <span className="text-muted">
              {event.date ? new Date(event.date).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "N/A"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-base">💵</span> 
            <span className="font-semibold text-text">Pass Pricing:</span> 
            <span className="text-primary font-bold">{event.price === 0 ? "Free Access / Open Pass" : `₹${event.price}`}</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-base">👥</span> 
            <span className="font-semibold text-text">Available Allocations:</span> 
            <span className="text-muted">{event.totalTickets ? `${event.totalTickets} spots remaining` : "N/A"}</span>
          </p>
        </div>

        {/* CORE CONTENT DESCRIPTION FRAME */}
        <div className="py-6">
          <h3 className="font-bold text-lg mb-2 text-white">About the Event</h3>
          <p className="text-muted leading-relaxed text-sm whitespace-pre-line">
            {event.description || "No supplemental details provided for this event profile allocation catalog item."}
          </p>
        </div>

        {/* UTILITY BAR FOOTER WRAPPER */}
        <div className="flex gap-4 pt-4 border-t border-border/40">
          <button
            onClick={() => navigate(-1)}
            className="w-1/3 py-2.5 border border-border rounded-xl font-medium hover:bg-surface-soft transition text-sm text-text"
          >
            ← Back to Board
          </button>
          
          <button
            onClick={handleProceedToPayment}
            className="w-2/3 py-2.5 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-soft transition shadow-md tracking-wide"
          >
            {event.price === 0 ? "Claim Free Pass" : "Proceed to Checkout Secure Pay →"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EventDetailPage;