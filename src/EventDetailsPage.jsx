import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventByIdAPI } from "./services/allAPI";
import Loader from "./Loader";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    getEventByIdAPI(id)
      .then((res) => {
        setEvent(res?.data || res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load event details.");
        setLoading(false);
      });
  }, [id]);

  const handleProceedToPayment = () => {
    if (!user) {
      alert("Please login first to purchase event passes.");
      return;
    }
    navigate("/checkout-payment", { state: { event, userId: user._id } });
  };

  if (loading) return <Loader text="Loading event details..." />;
  if (error || !event) return <div className="text-red-400 text-center pt-24">{error || "Event not found."}</div>;

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl overflow-hidden p-6 shadow-xl">
        <div className="text-center pb-6 border-b border-border">
          <span className="text-6xl block mb-2">{event.emoji || "📅"}</span>
          <h1 className="text-3xl font-bold text-white">{event.title || "Untitled Event"}</h1>
          {event.category && (
            <span className="inline-block bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full border border-primary/20 mt-2">
              {event.category}
            </span>
          )}
        </div>

        <div className="py-6 space-y-4 text-sm border-b border-border">
          <p className="flex items-center gap-2">
            <span>📍</span>
            <span className="font-semibold text-text">Venue:</span>
            <span className="text-muted">{event.location || event.venue || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2">
            <span>📅</span>
            <span className="font-semibold text-text">Date & Time:</span>
            <span className="text-muted">
              {event.date ? new Date(event.date).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "N/A"}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span>💵</span>
            <span className="font-semibold text-text">Price:</span>
            <span className="text-primary font-bold">{event.price === 0 ? "Free" : `₹${event.price}`}</span>
          </p>
          <p className="flex items-center gap-2">
            <span>👥</span>
            <span className="font-semibold text-text">Available Seats:</span>
            <span className="text-muted">{event.totalTickets ? `${event.totalTickets} spots` : "N/A"}</span>
          </p>
        </div>

        <div className="py-6">
          <h3 className="font-bold text-lg mb-2 text-white">About the Event</h3>
          <p className="text-muted leading-relaxed text-sm whitespace-pre-line">
            {event.description || "No details provided."}
          </p>
        </div>

        <div className="flex gap-4 pt-4 border-t border-border/40">
          <button onClick={() => navigate(-1)}
            className="w-1/3 py-2.5 border border-border rounded-xl font-medium hover:bg-surface-soft transition text-sm">
            ← Back
          </button>
          <button onClick={handleProceedToPayment}
            className="w-2/3 py-2.5 bg-primary text-black font-bold rounded-xl text-sm hover:bg-primary-soft transition">
            {event.price === 0 ? "Claim Free Pass" : "Proceed to Checkout →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;