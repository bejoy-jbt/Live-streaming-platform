import axios from "axios";
const BASE = import.meta.env.VITE_SIGNALING_URL || process.env.REACT_APP_SIGNALING_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: BASE
});
