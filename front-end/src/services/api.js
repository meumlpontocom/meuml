import axios        from "axios";
import { getToken } from "../services/auth";

export const headers = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

api.defaults.headers.common["Authorization"] = `Bearer ${getToken()}`;

export default api;
