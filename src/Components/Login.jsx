import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/allAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { email, password } = userData;

    if (!email || !password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await loginAPI(userData);

      if (res?.status === 200) {
        toast.success("Login successful");

        const { token, user } = res.data;

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        setTimeout(() => {
          navigate(user?.role === "admin" ? "/admin" : "/");
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res?.data?.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-bg text-text h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Event<span className="text-primary">.ly</span>
          </h1>
          <p className="text-muted text-sm mt-1">Welcome back</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl mb-6 font-semibold">Sign in</h2>

          <div className="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input"
            />

            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}