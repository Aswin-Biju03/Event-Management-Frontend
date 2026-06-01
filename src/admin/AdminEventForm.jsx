import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  getEventByIdAPI,
  createEventAPI,
  updateEventAPI,
} from "../services/allAPI";
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
    if (isEdit) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEventByIdAPI(id);
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
          image: e.image || "",
        });
      }
    } catch {
      toast.error("Failed to fetch event.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    const { title, date, location, totalTickets } = form;

    if (!title || !date || !location || !totalTickets) {
      return toast.error("Please fill all required fields");
    }

    try {
      setLoading(true);

      const res = isEdit
        ? await updateEventAPI(id, form)
        : await createEventAPI(form);

      if (res?.status === 200 || res?.status === 201) {
        toast.success(isEdit ? "Event updated!" : "Event created!");
        setTimeout(() => navigate("/admin/events"), 1200);
      } else {
        toast.error(res?.data?.message || "Operation failed.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading event details..." />;

  return (
    <div className="bg-bg text-text min-h-screen px-6 pt-24 pb-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? "Edit Event" : "New Event"}
        </h1>

        <div className="space-y-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
          <input type="date" name="date" value={form.date} onChange={handleChange} />
          <input type="time" name="time" value={form.time} onChange={handleChange} />
          <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
          <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="Price" />
          <input type="number" name="totalTickets" value={form.totalTickets} onChange={handleChange} placeholder="Tickets" />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
          <input type="url" name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
          />

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>

            <button onClick={() => navigate("/admin/events")}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}