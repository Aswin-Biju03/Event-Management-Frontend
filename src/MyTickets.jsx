import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getUserBookingsAPI } from "./services/allAPI";
import Loader from "./Loader";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (!storedUser) {
      setError("Please log in to view your tickets.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(storedUser);
    getUserBookingsAPI(user._id)
      .then((res) => {
        setTickets(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load tickets.");
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader text="Loading your tickets..." />;
  if (error) return <div className="text-red-400 text-center pt-24">{error}</div>;
  if (tickets.length === 0) return <div className="text-gray-400 text-center pt-24">No tickets booked yet.</div>;

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-white">My Passes</h1>
        <p className="text-sm text-muted mb-8">Present these QR codes at the entry checkpoint.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => {
            if (!t) return null;
            return (
              <div key={t._id} className="bg-surface border border-border rounded-2xl p-5 flex items-center gap-5 shadow-lg">
                <div className="bg-white p-3 rounded-xl shrink-0">
                  <QRCodeSVG value={t.ticketUuid || "Invalid-Token"} size={110} level="M" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{t.eventId?.title || "Event Entry Pass"}</h3>
                  <p className="text-xs text-muted mt-1 truncate">📍 {t.eventId?.location || t.eventId?.venue || "N/A"}</p>
                  <p className="text-xs text-muted mt-0.5">
                    📅 {t.eventId?.date ? new Date(t.eventId.date).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                  <div className="mt-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                      t.attended
                        ? "bg-green-500/10 border-green-500 text-green-400"
                        : "bg-primary/10 border-primary text-primary"
                    }`}>
                      {t.attended ? "✓ Checked In" : "• Valid Pass"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}