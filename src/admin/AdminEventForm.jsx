import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getEventByIdAPI, createEventAPI, updateEventAPI } from "../services/allAPI";
import Loader from "../Loader";

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  price: "",
  totalTickets: "",
  category: "",
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
          const d = e.date ? new Date(e.date) : null;
          setForm({
            title: e.title || "",
            description: e.description || "",
            date: d ? d.toISOString().split("T")[0] : "",
            time: d ? d.toTimeString().slice(0, 5) : "",
            location: e.location || "",
            price: e.price ?? "",
            totalTickets: e.totalTickets ?? "",
            category: e.category || "",
          });
        }
        setFetching(false);
      })
      .catch(() => {
        toast.error("Failed to fetch event.");
        setFetching(false);
      });
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const { title, date, location, totalTickets } = form;
    if (!title || !date || !location || !totalTickets) {
      return toast.error("Please fill all required fields");
    }
    setLoading(true);
    const call = isEdit ? updateEventAPI(id, form) : createEventAPI(form);
    call
      .then((res) => {
        if (res?.status === 200 || res?.status === 201) {
          toast.success(isEdit ? "Event updated!" : "Event created!");
          setTimeout(() => navigate("/admin/events"), 1200);
        } else {
          toast.error(res?.data?.message || "Operation failed.");
          setLoading(false);
        }
      })
      .catch(() => {
        toast.error("Something went wrong.");
        setLoading(false);
      });
  };

  if (fetching) return <Loader text="Loading event details..." />;

  const inputCls = "w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition";
  const labelCls = "text-xs text-muted uppercase tracking-wider block mb-1.5";

  return (
    <div className="bg-bg text-text min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 pb-4 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted mb-1">Admin</p>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Event" : "New Event"}</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Title <span className="text-primary">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Kochi Music Fest" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date <span className="text-primary">*</span></label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Location <span className="text-primary">*</span></label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Venue address" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0 for free" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Total Tickets <span className="text-primary">*</span></label>
              <input type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} placeholder="e.g. 500" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Music, Tech, Sports" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Tell attendees what to expect..." rows={3}
              className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-primary text-black px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-soft transition disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
            </button>
            <button onClick={() => navigate("/admin/events")}
              className="border border-border px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-soft transition">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} style={{ zIndex: 9999 }} />
    </div>
  );
}