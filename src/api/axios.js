import axios from 'axios';
import toast from 'react-hot-toast';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const api = axios.create({
  baseURL: `${apiUrl}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach JWT ───────────────────────────────────
api.interceptors.request.use((config) => {
  // Read token directly from localStorage so we don't
  // create a circular dependency with the Zustand store
  const raw = localStorage.getItem('auth-storage');
  if (raw) {
    try {
      const { state } = JSON.parse(raw);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

// ── Response: handle errors globally ─────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const message = err.response?.data?.message || 'Something went wrong';

    if (status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action');
      return Promise.reject(err);
    }

    if (status >= 500) {
      toast.error('Server error — please try again later');
      return Promise.reject(err);
    }

    // Let callers handle 400 / 404 / 409 themselves
    return Promise.reject({ ...err, message });
  }
);

export default api;
