import apiService from "../api/apiService";

// AUTH APIs
export const registerAPI = (data) => apiService("POST", "/register", data);
export const loginAPI = (data) => apiService("POST", "/login", data);


// EVENTS APIs (USER)
export const getAllEventsAPI = () => apiService("GET", "/events");
export const getEventByIdAPI = (id) => apiService("GET", `/events/${id}`);


// EVENTS APIs (ADMIN CONTROL)
export const createEventAPI = (data) => apiService("POST", "/events", data);
export const updateEventAPI = (id, data) => apiService("PUT", `/events/${id}`, data);
export const deleteEventAPI = (id) => apiService("DELETE", `/events/${id}`);

// BOOKINGS & CHECK-IN APIs
export const bookEventAPI = (data) => apiService("POST", "/bookings", data);
export const getUserBookingsAPI = (userId) => apiService("GET", `/bookings/user/${userId}`);
export const verifyTicketAttendanceAPI = (ticketUuid) => apiService("PATCH", `/bookings/verify/${ticketUuid}`);

export const getAllBookingsAPI = () => apiService("GET", "/admin/bookings");