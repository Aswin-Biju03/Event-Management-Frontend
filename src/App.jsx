import { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components & Pages
import Navbar from "./Components/Navbar";
import Home from "./Home";
import EventsPage from "./EventsPage";
import EventDetailPage from "./EventDetailsPage";
import MyTickets from "./MyTickets"; // Imported your new My Tickets component
import Register from "./Components/Register";
import Login from "./Components/Login";
import PaymentPage from "./PaymentPage";

// Admin Pages
import AdminHome from "./admin/AdminHome";
import AdminEvents from "./admin/AdminEvents";
import AdminEventForm from "./admin/AdminEventForm";
import AdminScanner from "./admin/AdminScanner";

import { routeContext } from "./contextAPI/routeGuardContext";

function App() {
  const { role, authorisedUser } = useContext(routeContext);
  const [isLoading, setIsLoading] = useState(true);

  // Simple loader on app mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer); // Clean up timer
  }, []);

  if (isLoading) {
    return <p className="text-white text-center pt-24">Loading...</p>;
  }

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Routes */}
        {role === "user" && authorisedUser && (
          <>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/event-detail/:id" element={<EventDetailPage />} />
            <Route path="/checkout-payment" element={<PaymentPage />} />
            <Route path="/my-tickets" element={<MyTickets />} /> {/* Added ticket route pass */}
          </>
        )}

        {/* Admin Protected Routes */}
        {role === "admin" && authorisedUser && (
          <>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/events/new" element={<AdminEventForm />} />
            <Route path="/admin/events/edit/:id" element={<AdminEventForm />} />
            <Route path="/admin/scanner" element={<AdminScanner />} />
          </>
        )}

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;