import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getEventByIdAPI, createEventAPI, updateEventAPI } from "../services/allAPI";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  price: "",
  totalTickets: "",
  category: "",
  image: "",
};

export default function AdminEventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;

    getEventByIdAPI(id)
      .then((res) => {
        const e = res?.data?.event || res?.data;
        if (e) {
          const dateObj = e.date ? new Date(e.date) : null;
          setForm({
            title: e.title || "",
            description: e.description || "",
            date: dateObj ? dateObj.toISOString().split("T")[0] : "",
            time: dateObj ? dateObj.toTimeString().slice(0, 5) : "",
            location: e.location || "",
            price: e.price ?? "",
            totalTickets: e.totalTickets ?? "",
            category: e.category || "",
            image: e.image || "",
          });
        }
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch event details.");
        setFetching(false);
      });
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const { title, date, location, totalTickets } = form;
    if (!title || !date || !location || !totalTickets) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    const apiCall = isEdit ? updateEventAPI(id, form) : createEventAPI(form);

    apiCall
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          toast.success(isEdit ? "Event updated!" : "Event created!");
          setTimeout(() => navigate("/admin/events"), 1200);
        } else {
          toast.error(res?.data?.message || "Operation failed.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong.");
        setLoading(false);
      });
  };

  const fields = [
    { name: "title", label: "Event Title", type: "text", placeholder: "e.g. Kochi Music Fest", required: true, full: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time", type: "time" },
    { name: "location", label: "Location", type: "text", placeholder: "Venue address", required: true },
    { name: "price", label: "Ticket Price (₹)", type: "number", placeholder: "0 for free" },
    { name: "totalTickets", label: "Total Tickets", type: "number", placeholder: "e.g. 500", required: true },
    { name: "category", label: "Category", type: "text", placeholder: "e.g. Music, Tech" },
    { name: "image", label: "Image URL", type: "url", placeholder: "https://...", full: true },
  ];

  if (fetching) return <div className="text-muted text-sm text-center pt-24">Loading event parameters...</div>;

  return (
    <div className="bg-bg text-text min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6 pb-4 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted mb-1">Admin Panel</p>
          <h1 className="text-3xl font-bold">{isEdit ? "Edit Event" : "New Event"}</h1>
        </div>

        {/* INPUT GRID LAYER */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(({ name, label, type, placeholder, required, full }) => (
              <div key={name} className={full ? "md:col-span-2" : ""}>
                <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-medium">
                  {label} {required && <span className="text-primary">*</span>}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-xs text-muted uppercase tracking-wider mb-1.5 font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell attendees what to expect..."
                rows={4}
                className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition resize-none"
              />
            </div>
          </div>

          {/* ACTIONS FOOTER LINK MATRIX */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-soft transition disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button
              onClick={() => navigate("/admin/events")}
              className="border border-border px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
      <ToastContainer position="top-center" autoClose={2000} style={{ zIndex: 9999 }} />
    </div>
  );
}