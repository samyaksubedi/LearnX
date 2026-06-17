import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message;
    const status = error.response?.status;

    // Only intercept 401s when user is authenticated (has accessToken)
    // Public route 401s (wrong password, unverified email) should pass through
    const isAuthenticated = !!useAuthStore.getState().accessToken;

    if (status === 401 && !originalRequest._retry && isAuthenticated) {
      if (message === 'Token expired') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            {},
            { withCredentials: true },
          );
          const newAccessToken = response.data.data.accessToken;
          useAuthStore.getState().setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearAuth();
          window.location.href = '/';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Authenticated user got a non-expiry 401 (session revoked etc) → clear and redirect
      useAuthStore.getState().clearAuth();
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Not authenticated or not a 401 — just pass the error through
    // Sign-in errors, verify email errors etc will reach the component's catch block
    return Promise.reject(error);
  },
);

export default api;
