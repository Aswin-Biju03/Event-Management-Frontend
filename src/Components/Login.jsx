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
  const handleLogin = () => {
    const { email, password } = userData;
    if (!email || !password) {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    loginAPI(userData)
      .then((res) => {
        if (res?.status === 200) {
          toast.success("Login successful");
          const { token, user } = res.data;
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("user", JSON.stringify(user));
          setTimeout(() => {
            if (user?.role === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
            window.location.reload();
          }, 1500);
        } else {
          toast.error(res?.data?.message || "Login failed");
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
    <div className="bg-bg text-text h-screen flex items-center justify-center px-4 overflow-hidden">
      {" "}
      <div className="w-full max-w-sm">
        {" "}
        {/* LOGO */}{" "}
        <div className="mb-8 text-center">
          {" "}
          <h1 className="text-2xl font-bold text-white">
            {" "}
            Event<span className="text-primary">.ly</span>{" "}
          </h1>{" "}
          <p className="text-muted text-sm mt-1">Welcome back</p>{" "}
        </div>{" "}
        {/* INTERFACE PANEL CARD */}{" "}
        <div className="bg-surface border border-border rounded-2xl p-8">
          {" "}
          <h2 className="text-xl mb-6 font-semibold">Sign in</h2>{" "}
          <div className="flex flex-col gap-4">
            {" "}
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            />{" "}
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            />{" "}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-black font-semibold py-2.5 rounded-lg hover:bg-primary-soft transition"
            >
              {" "}
              {loading ? "Signing in..." : "Sign in"}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <p className="text-center text-sm text-muted mt-6">
          {" "}
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            {" "}
            Register{" "}
          </Link>{" "}
        </p>{" "}
      </div>{" "}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        style={{ zIndex: 9999 }}
      />{" "}
    </div>
  );
}
