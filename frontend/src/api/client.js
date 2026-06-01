// frontend/src/api/client.js
// Single axios instance for the whole app.
// baseURL comes from the Vite env variable set in frontend/.env

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: log errors and re-throw so components can handle them.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown error";
    console.error("[API Error]", msg, error);
    return Promise.reject(error);
  }
);

export default apiClient;
