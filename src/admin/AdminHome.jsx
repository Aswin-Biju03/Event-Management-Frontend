import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEventsAPI, getAllBookingsAPI } from "../services/allAPI";
import Loader from "../components/Loader";

export default function AdminHome() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAllEventsAPI(), getAllBookingsAPI()])
      .then(([eventsRes, bookingsRes]) => {
        const eventsData = eventsRes?.data?.events || eventsRes?.data || eventsRes || [];
        const bookingsData = bookingsRes?.data || bookingsRes || [];
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard metrics.");
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <div className="text-red-400 text-center pt-24">{error}</div>;

  const now = new Date();
  const upcomingCount = events.filter((e) => new Date(e.date) > now).length;
  const calculatedTicketsCount = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.eventId?.price || 0), 0);

  const stats = [
    { label: "Total Events", value: events.length },
    { label: "Upcoming Events", value: upcomingCount },
    { label: "Tickets Sold", value: calculatedTicketsCount.toLocaleString() },
    { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}` },
  ];

  return (
    <div className="bg-bg text-text min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-muted">Overview of platform data metrics.</p>
          </div>
          <Link to="/admin/events/new"
            className="bg-primary text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-soft transition">
            + New Event
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted uppercase tracking-wider mb-1 font-medium">{label}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-white">Recent Event Timeline</h2>
          {events.length === 0 ? (
            <p className="text-muted text-sm">No events found.</p>
          ) : (
            <div className="divide-y divide-border">
              {events.slice(0, 4).map((e) => {
                const isUpcoming = new Date(e.date) > now;
                return (
                  <div key={e._id || e.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-text">{e.title || "Untitled Event"}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {e.date ? new Date(e.date).toLocaleDateString("en-IN") : "Date N/A"}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      isUpcoming ? "border-primary text-primary" : "border-border text-muted"
                    }`}>
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Link to="/admin/events"
            className="border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition text-white">
            Manage Events
          </Link>
          <Link to="/admin/scanner"
            className="border border-primary bg-primary/5 text-primary px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/10 transition">
            QR Scanner →
          </Link>
        </div>
      </div>
    </div>
  );
}