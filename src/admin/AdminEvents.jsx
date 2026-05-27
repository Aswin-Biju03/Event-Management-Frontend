import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllEventsAPI, deleteEventAPI } from "../services/allAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  const now = new Date();

  // Load events table list on mount
  useEffect(() => {
    getAllEventsAPI()
      .then((res) => {
        const data = res?.data?.events || res?.data || res || [];
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load events list.");
        setLoading(false);
      });
  }, []);

  // Execution delete pipeline matching your Axios Instance interceptors
  const handleDelete = (id) => {
    deleteEventAPI(id)
      .then(() => {
        // Remove item from state to clear it instantly from screen
        setEvents((prev) => prev.filter((item) => item._id !== id));
        toast.success("Event successfully deleted.");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message || "Delete request failed.");
      })
      .finally(() => setConfirmId(null));
  };

  // Live filter / search calculator logic
  const filtered = events.filter((e) => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const isUpcoming = new Date(e.date) > now;
    if (filter === "upcoming") return matchSearch && isUpcoming;
    if (filter === "past") return matchSearch && !isUpcoming;
    return matchSearch;
  });

  if (loading) return <div className="text-white text-center pt-24">Loading events list...</div>;
  if (error) return <div className="text-red-400 text-center pt-24">{error}</div>;

  return (
    <div className="bg-bg text-text min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold">Manage Events</h1>
            <p className="text-sm text-muted mt-1">{events.length} total events listed</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/events/new" className="bg-primary text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-soft transition">
              + New Event
            </Link>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search events by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface border border-border rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none"
          />
          <div className="flex gap-2">
            {["all", "upcoming", "past"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm capitalize font-medium transition ${
                  filter === f ? "bg-primary text-black" : "border border-border hover:bg-surface-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* TABULAR LAYOUT MAPPER */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted py-12">No matching events found.</p>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase bg-surface-soft">
                  <th className="px-5 py-3">Event Details</th>
                  <th className="px-5 py-3 hidden md:table-cell">Date Scheduled</th>
                  <th className="px-5 py-3 hidden md:table-cell">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((event) => {
                  const isUpcoming = new Date(event.date) > now;
                  return (
                    <tr key={event._id || event.id} className="hover:bg-bg/40 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-text">{event.title || "Untitled Event"}</p>
                        <p className="text-xs text-muted truncate max-w-[220px]">{event.location || event.venue || "N/A"}</p>
                      </td>
                      <td className="px-5 py-4 text-muted hidden md:table-cell">
                        {event.date ? new Date(event.date).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell font-medium">
                        {event.price === 0 ? <span className="text-primary">Free</span> : `₹${event.price}`}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                          isUpcoming ? "border-primary text-primary" : "border-border text-muted"
                        }`}>
                          {isUpcoming ? "Upcoming" : "Past"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/events/edit/${event._id}`} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-surface-soft transition">
                            Edit
                          </Link>
                          
                          {confirmId === event._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(event._id)} className="text-xs px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold">
                                Confirm
                              </button>
                              <button onClick={() => setConfirmId(null)} className="text-xs px-2.5 py-1.5 border border-border rounded-lg hover:bg-surface-soft transition">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmId(event._id)} className="text-xs px-3 py-1.5 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/20 transition">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
      <ToastContainer position="top-center" autoClose={2000} style={{ zIndex: 9999 }} />
    </div>
  );
}