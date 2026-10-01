import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('genesis_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean storage
      if (!window.location.pathname.startsWith('/proposal/view/')) {
        localStorage.removeItem('genesis_auth_token');
        localStorage.removeItem('genesis_user');
      }
    }
    return Promise.reject(error);
  }
);
