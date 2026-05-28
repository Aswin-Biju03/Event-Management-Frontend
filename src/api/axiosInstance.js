import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://event-management-backend-40ut.onrender.com", // ⚠️ change if your backend runs elsewhere
  timeout: 10000,
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR (ATTACH TOKEN)
// ─────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response Received");
    return response;
  },
  (error) => {
    if (!error.response) {
      console.log("❌ Network Error - Server not reachable");
      return Promise.reject(error);
    }

    const status = error.response.status;

    switch (status) {
      case 400:
        console.log("❌ Bad Request");
        break;

      case 401:
        console.log("❌ Unauthorized - Invalid Token");

        break;

      case 403:
        console.log("❌ Forbidden - Access Denied");
        break;

      case 404:
        console.log("❌ API Not Found");
        break;

      case 500:
        console.log("❌ Server Error");
        break;

      default:
        console.log("❌ Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
