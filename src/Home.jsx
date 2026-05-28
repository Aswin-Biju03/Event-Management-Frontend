import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllEventsAPI } from "./services/allAPI";
import Loader from "./Loader";


function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllEventsAPI()
      .then((res) => {
        const data = res?.data || res || [];
        setEvents(Array.isArray(data) ? data : data?.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading homepage events:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader text="Loading events..." />;

  return (
    <div className="bg-bg text-text min-h-screen pt-16">
      <div className="bg-gradient-to-br from-surface to-black px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-muted mb-4">Kerala's Premier Event Platform</p>
          <h1 className="text-4xl md:text-6xl leading-tight mb-4 font-bold">
            Discover <em className="text-primary italic font-normal">unforgettable</em> events near you
          </h1>
          <p className="text-lg text-muted max-w-xl mb-8">
            Book tickets, receive instant QR passes, and check in seamlessly — all from your phone.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/events" className="bg-primary text-black px-7 py-3 rounded-xl font-medium hover:bg-primary-soft transition">
              Browse Events
            </Link>
          </div>
          <div className="flex flex-wrap gap-10 mt-12 pt-8 border-t border-border">
            {[["120+", "Events this year"], ["4,800+", "Tickets issued"], ["98%", "Happy attendees"]].map(([number, label]) => (
              <div key={label}>
                <div className="text-3xl font-bold">{number}</div>
                <div className="text-sm text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Link to="/events" className="text-muted hover:text-text text-sm">View all →</Link>
        </div>
        {events.length === 0 ? (
          <p className="text-muted text-sm">No upcoming events listed right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => {
              if (!event) return null;
              const eventDate = event.date
                ? new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "N/A";
              const venueCity = typeof event.venue === "string"
                ? event.venue.split(",").pop().trim() : "Location N/A";
              return (
                <div key={event._id || event.id} onClick={() => navigate(`/event-detail/${event._id}`)}
                  className="bg-surface border border-border rounded-2xl hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col justify-between h-full">
                  <div>
                    <div className="relative h-40 bg-gradient-to-br from-surface-soft to-black flex items-center justify-center">
                      <span className="text-5xl">{event.emoji || "📅"}</span>
                      <div className="absolute top-3 left-3 bg-bg text-text text-xs font-semibold px-2 py-1 rounded-md border border-border">
                        {eventDate}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-text truncate mb-2">{event.title || "Untitled Event"}</h3>
                      <div className="flex gap-4 text-sm text-muted">
                        <span>📍 {venueCity}</span>
                        <span className="text-primary font-semibold">{event.price === 0 ? "Free" : `₹${event.price}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-border bg-bg flex justify-end">
                    <button className="bg-primary text-black text-sm font-semibold px-4 py-1.5 rounded-md hover:bg-primary-soft transition">
                      View Event →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;