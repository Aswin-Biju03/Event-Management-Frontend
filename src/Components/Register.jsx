import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAPI } from "../services/allAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);

    registerAPI(userData)
      .then((res) => {
        // If status is 201 or 200, assume success
        if (res?.status === 201 || res?.status === 200) {
          toast.success(res?.data?.message || "Registered successfully");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          toast.error(res?.data?.message || "Registration failed");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(err?.response?.data?.message || "Something went wrong");
        setLoading(false);
      });
  };

  return (
    <div className="bg-bg text-text h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* LOGO */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Event<span className="text-primary">.ly</span>
          </h1>
          <p className="text-muted text-sm mt-1">Create your account</p>
        </div>

        {/* FORM SURFACE CONTAINER */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl mb-6 font-semibold">Get started</h2>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            />

            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            />

            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-primary text-black font-semibold py-2.5 rounded-lg hover:bg-primary-soft transition"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </div>
        </div>

        {/* FOOTER NAVIGATION BANNER */}
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={2000} style={{ zIndex: 9999 }} />
    </div>
  );
}