import axios from 'axios';
import { toast } from 'react-toastify';
import {
  setAuth,
  setSessionExpired,
  setSessionRestoring,
} from '../store/slices/authSlice';

const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lazy-load Redux store to avoid circular imports
let store;
const loadStore = async () => {
  if (!store) {
    try {
      const mod = await import('../store/store');
      store = mod.store;
    } catch (error) {
      console.error('❌ Failed to load store:', error);
    }
  }
  return store;
};

// Refresh queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// ✅ Add token to requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ✅ Handle 401 errors & retry
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      toast.error('⚠️ Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status } = error.response;

    if (status === 403) {
      toast.error('❌ Access denied.');
      return Promise.reject(error);
    }

    if (status >= 500) {
      toast.error('💥 Server error. Please try again later.');
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken')?.trim();
      if (!refreshToken) throw new Error('No refresh token available');

      const storeInstance = await loadStore();
      storeInstance?.dispatch(setSessionRestoring(true));

      console.log('🔄 Token expired, attempting refresh...');

      const res = await axios.post(`${baseURL}/api/token/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = res.data;

      if (!accessToken) throw new Error('No access token received');

      localStorage.setItem('authToken', accessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const user = JSON.parse(localStorage.getItem('user') || 'null');
      storeInstance?.dispatch(
        setAuth({
          token: accessToken,
          refreshToken: newRefreshToken || refreshToken,
          user,
        })
      );

      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      console.log('✅ Token refreshed via 401 handler');

      return instance(originalRequest);
    } catch (refreshError) {
      console.error('🔐 Token refresh failed:', refreshError);

      if (refreshError.response?.status === 401 || refreshError.response?.status === 400) {
        console.log('🚪 Session expired. Redirecting...');
        localStorage.clear();

        const storeInstance = await loadStore();
        storeInstance?.dispatch(setSessionExpired(true));
        toast.error('Session expired. Please log in again.');

        if (window.location.pathname !== '/auth') {
          setTimeout(() => (window.location.href = '/auth'), 1000);
        }
      } else {
        toast.error('⚠️ Network error. Try again.');
      }

      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      const storeInstance = await loadStore();
      storeInstance?.dispatch(setSessionRestoring(false));
    }
  }
);

export default instance;
