import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5054/api",
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartpm_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;