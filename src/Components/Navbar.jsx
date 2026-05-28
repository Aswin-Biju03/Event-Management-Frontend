import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear(); 
    setUser(null);
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 h-16 border-b border-border/40 bg-bg/80 backdrop-blur-md">
      
      {/* LOGO */}
      <Link to="/" className="text-xl text-white font-bold">
        Event<span className="text-primary">.ly</span>
      </Link>

      <div className="flex items-center gap-4 text-sm text-muted">
        
        {!user && (
          <>
            <Link to="/events" className="hover:text-text transition">Events</Link>
            <Link to="/login" className="hover:text-text transition">Login</Link>
            <Link to="/register" className="bg-primary text-black px-3 py-1.5 rounded font-medium hover:bg-primary-soft transition">
              Register
            </Link>
          </>
        )}

        {user && !isAdmin && (
          <>
            <Link to="/events" className="hover:text-text transition">Events</Link>
            <Link to="/my-tickets" className="hover:text-text transition">My Tickets</Link>
          </>
        )}

        {user && isAdmin && (
          <>
            <Link to="/admin" className="hover:text-text transition">Dashboard</Link>
            <Link to="/admin/events" className="hover:text-text transition">Manage Events</Link>
            <Link to="/admin/scanner" className="hover:text-text transition">Scanner</Link>
          </>
        )}

        {user && (
          <div className="flex items-center gap-3 ml-2">
            <div className="w-8 h-8 bg-primary text-black font-bold flex items-center justify-center rounded-full">
              {(user.username || user.name || "U")[0].toUpperCase()}
            </div>
            <button onClick={handleLogout} className="hover:text-text transition">
              Logout
            </button>
          </div>
        )}
        
      </div>
    </nav>
  );
}