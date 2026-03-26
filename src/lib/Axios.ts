import axios from 'axios';

const api = axios.create({
  // Usamos la misma variable que definiste
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true, // 👈 ¡CRUCIAL para que funcionen las cookies!
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      error.status = error.response.status;
      error.data = error.response.data;
      error.message = error.response.data.message || error.message;
      error.data = error.response.data; 
    }
    return Promise.reject(error);
  }
);

export default api;