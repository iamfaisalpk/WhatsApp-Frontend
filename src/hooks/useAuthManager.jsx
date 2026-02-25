import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  setAuth,
  setSessionExpired,
  setSessionRestoring,
} from "../assets/store/slices/authSlice";

const baseURL = import.meta.env.VITE_API_URL;

const useAuthManager = () => {
  const dispatch = useDispatch();
  const { token, refreshToken } = useSelector((state) => state.auth);
  const timerRef = useRef(null);
  const activityRef = useRef(Date.now());

  useEffect(() => {
    const updateActivity = () => (activityRef.current = Date.now());
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, []);

  useEffect(() => {
    const refreshAccessToken = async () => {
      if (!refreshToken) return;

      try {
        dispatch(setSessionRestoring(true));
        const response = await axios.post(`${baseURL}/api/token/refresh`, {
          refreshToken: refreshToken.trim(),
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        const user = JSON.parse(localStorage.getItem("user") || "null");

        localStorage.setItem("authToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        dispatch(
          setAuth({
            token: accessToken,
            refreshToken: newRefreshToken || refreshToken,
            user,
          }),
        );
      } catch (err) {
        console.error(" Token refresh failed:", err);
        dispatch(setSessionExpired(true));
      } finally {
        dispatch(setSessionRestoring(false));
      }
    };

    const checkTokenExpiry = () => {
      if (!token) return;

      try {
        const { exp } = jwtDecode(token);
        const now = Date.now() / 1000;
        const timeLeft = exp - now;

        const userIsActive = Date.now() - activityRef.current < 5 * 60 * 1000;

        if (timeLeft < 60 && userIsActive) {
          refreshAccessToken();
        } else {
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(
            checkTokenExpiry,
            (timeLeft - 50) * 1000,
          );
        }
      } catch (err) {
        console.error("🔴 Invalid token:", err);
      }
    };

    checkTokenExpiry();

    return () => clearTimeout(timerRef.current);
  }, [token, refreshToken, dispatch]);
};

export default useAuthManager;
