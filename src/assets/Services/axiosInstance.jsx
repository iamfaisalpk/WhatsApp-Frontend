import axios from "axios";
import { toast } from "react-toastify";
import {
  setAuth,
  setSessionExpired,
  setSessionRestoring,
  logoutUser,
} from "../store/slices/authSlice";

const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL,
  timeout: 120000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Dedicated instance for token refresh to avoid loops
const refreshInstance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
});

let store;
const loadStore = async () => {
  if (!store) {
    try {
      const mod = await import("../store/store");
      store = mod.store;
    } catch (error) {
      console.error(" Failed to load store:", error);
    }
  }
  return store;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (
      (status === 401 ||
        (status === 404 && data?.message?.includes("User not found"))) &&
      !originalRequest._retry
    ) {
      if (status === 404) {
        // Force logout for missing user
        const storeInstance = await loadStore();
        storeInstance?.dispatch(logoutUser());
        return Promise.reject(error);
      }
      originalRequest._retry = true;
    } else {
      return Promise.reject(error);
    }

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
      const refreshToken = localStorage.getItem("refreshToken")?.trim();
      if (!refreshToken) throw new Error("No refresh token available");

      const storeInstance = await loadStore();
      storeInstance?.dispatch(setSessionRestoring(true));

      const res = await refreshInstance.post("/api/token/refresh", {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken, user } = res.data;

      if (!accessToken) throw new Error("No access token received");

      localStorage.setItem("authToken", accessToken);
      if (newRefreshToken)
        localStorage.setItem("refreshToken", newRefreshToken);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      storeInstance?.dispatch(
        setAuth({
          token: accessToken,
          refreshToken: newRefreshToken || refreshToken,
          user: user || JSON.parse(localStorage.getItem("user") || "null"),
        }),
      );

      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    } catch (refreshError) {
      const storeInstance = await loadStore();
      storeInstance?.dispatch(logoutUser());

      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      const storeInstance = await loadStore();
      storeInstance?.dispatch(setSessionRestoring(false));
    }
  },
);

export default instance;
