import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle token expiration (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/token/`, {
      username,
      password,
    });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  getCurrentUser: () => {
    return localStorage.getItem('username');
  }
};

export const ingestionService = {
  uploadSAP: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/sap/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadUtility: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/utility/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadTravel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/travel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const recordsService = {
  getRecords: async (filters = {}) => {
    const response = await api.get('/records/', { params: filters });
    return response.data;
  },
  updateRecord: async (id, data) => {
    const response = await api.put(`/records/${id}/`, data);
    return response.data;
  },
  approveRecord: async (id) => {
    const response = await api.post(`/records/${id}/approve/`);
    return response.data;
  },
  lockRecord: async (id) => {
    const response = await api.post(`/records/${id}/lock/`);
    return response.data;
  },
  rejectRecord: async (id) => {
    const response = await api.post(`/records/${id}/reject/`);
    return response.data;
  },
};

export const auditService = {
  getAuditLogs: async () => {
    const response = await api.get('/audit-logs/');
    return response.data;
  },
};

export default api;
