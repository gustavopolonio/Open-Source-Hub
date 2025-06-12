import axios from "axios";

export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
