import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect without hard reload so React Router stays in control
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data) => api.post('/register', data),
  login:    (data) => api.post('/login', data),
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export const notesApi = {
  getAll:  (params) => api.get('/notes', { params }),
  getById: (id)     => api.get(`/notes/${id}`),
  create:  (data)   => api.post('/notes', data),
  update:  (id, data) => api.put(`/notes/${id}`, data),
  remove:  (id)     => api.delete(`/notes/${id}`),
  share:   (id, data) => api.post(`/notes/${id}/share`, data),
};

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchApi = {
  search: (q, params) => api.get('/search', { params: { q, ...params } }),
};

export default api;
