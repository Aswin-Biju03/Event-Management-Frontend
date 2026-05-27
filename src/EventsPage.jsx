import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEventsAPI } from "./services/allAPI";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get logged-in user from storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Fetch Events from API
    getAllEventsAPI()
      .then((res) => {
        const data = res?.data || res || [];
        setEvents(Array.isArray(data) ? data : data?.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load events.");
        setLoading(false);
      });
  }, []);

  // --- UI STATE RENDERS ---
  if (loading) return <div className="text-white text-center pt-24">Loading events...</div>;
  if (error) return <div className="text-red-400 text-center pt-24">{error}</div>;
  if (!events.length) return <div className="text-gray-400 text-center pt-24">No events found.</div>;

  return (
    <div className="w-full min-h-screen bg-bg text-text px-6 pt-24 pb-12">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Explore Events</h1>
          <p className="text-sm text-muted">Discover upcoming experiences.</p>
        </div>
        {user && (
          <div className="text-sm bg-surface-soft border border-border px-4 py-2 rounded-xl">
            Logged in as: <span className="font-semibold text-primary">{user.username || "Guest"}</span>
          </div>
        )}
      </div>

      {/* EVENTS GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          if (!event) return null;

          // Clean, readable split for the venue text field
          const shortVenue = typeof event.venue === "string" 
            ? event.venue.split(",").pop().trim() 
            : "Location N/A";

          // Format Date
          const eventDate = event.date 
            ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) 
            : "N/A";

          return (
            <div
              key={event._id || event.id}
              onClick={() => navigate(`/event-detail/${event._id}`)}
              className="bg-surface border border-border rounded-2xl hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col justify-between h-full"
            >
              {/* TOP LAYOUT (IMAGE & BASIC INFO) */}
              <div>
                <div className="relative h-44 bg-gradient-to-br from-surface-soft to-black flex items-center justify-center">
                  <span className="text-5xl">{event.emoji || "📅"}</span>
                  <div className="absolute top-3 left-3 bg-bg text-text text-xs font-semibold px-2 py-1 rounded-md border border-border">
                    {eventDate}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-text truncate mb-2">
                    {event.title || "Untitled Event"}
                  </h3>
                  <div className="flex gap-4 text-sm text-muted">
                    <span>📍 {shortVenue}</span>
                    <span className="text-primary font-semibold">
                      {event.price === 0 ? "Free" : `₹${event.price}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS BUTTON */}
              <div className="px-5 py-3 border-t border-border bg-bg flex justify-end">
                <button className="bg-primary text-black text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-primary-soft transition">
                  View Event →
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default EventsPage;