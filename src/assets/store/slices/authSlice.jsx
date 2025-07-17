import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import socket from "../../../../utils/socket";
const baseURL = import.meta.env.VITE_API_URL;

const tokenFromStorage = localStorage.getItem("authToken");
const userFromStorage = JSON.parse(localStorage.getItem("user")) || null;
const refreshTokenFromStorage = localStorage.getItem("refreshToken");

const initialState = {
  currentStep: "phone",
  phoneNumber: "",
  countryCode: "+91",
  otp: "",
  loading: false,
  isVerifying: false,
  error: "",
  success: "",
  resendTimer: 0,
  sessionId: "",
  debugInfo: "",
  generatedOtpForTest: "",
  user: userFromStorage,
  isAuthLoaded: false,
  token: tokenFromStorage,
  refreshToken: refreshTokenFromStorage,
  sessionExpired: false,
  sessionRestoring: false,
};

const formatPhoneNumber = (countryCode, phoneNumber) => {
  const cleanPhone = phoneNumber.replace(/^0+/, "").replace(/\D/g, "");
  if (countryCode === "+91" && cleanPhone.length !== 10) {
    throw new Error(
      `Invalid Indian phone number. Expected 10 digits, got ${cleanPhone.length}`
    );
  }
  return `${countryCode}${cleanPhone}`;
};

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return rejectWithValue({
          message: "No refresh token found. Please login again.",
        });
      }

      const response = await fetch(`${baseURL}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue({
          message: data.message || "Failed to refresh access token",
        });
      }

      if (data.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }

      return data.accessToken;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to refresh token",
      });
    }
  }
);

export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async (_, { getState, rejectWithValue }) => {
    const { phoneNumber, countryCode } = getState().auth;

    try {
      const fullPhone = formatPhoneNumber(countryCode, phoneNumber);

      const response = await fetch(`${baseURL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data);
      return data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.message || "Network error. Please check your backend server.",
        details: error.toString(),
      });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (_, { getState, rejectWithValue }) => {
    const state = getState().auth;
    const { phoneNumber, countryCode, otp, sessionId, user } = state;

    if (user) {
      return rejectWithValue({ message: "User already verified" });
    }

    try {
      const fullPhone = formatPhoneNumber(countryCode, phoneNumber);
      const cleanOtp = otp.trim();

      if (!fullPhone)
        return rejectWithValue({ message: "Phone number is required" });
      if (!cleanOtp) return rejectWithValue({ message: "OTP is required" });
      if (cleanOtp.length !== 6)
        return rejectWithValue({
          message: `OTP must be 6 digits (got ${cleanOtp.length})`,
        });
      if (!/^\d{6}$/.test(cleanOtp))
        return rejectWithValue({ message: "OTP must contain only numbers" });

      const requestPayload = {
        phone: fullPhone,
        otp: cleanOtp,
        ...(sessionId && { sessionId }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestPayload),
        }
      );

      const data = await response.json();
      console.log("response otp", data);

      if (!response.ok) {
        let errorMessage = data.message || "OTP verification failed";
        if (response.status === 400) {
          if (
            data.message?.includes("not found") ||
            data.message?.includes("expired")
          ) {
            errorMessage =
              "OTP has expired or is invalid. Please request a new OTP.";
          } else if (data.message?.includes("invalid")) {
            errorMessage = "Invalid OTP. Please check and try again.";
          }
        }
        return rejectWithValue({
          ...data,
          message: errorMessage,
          status: response.status,
        });
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Network error. Please try again.",
        details: error.toString(),
        type: "NETWORK_ERROR",
      });
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (_, { getState, dispatch, rejectWithValue }) => {
    dispatch(clearMessages());
    return dispatch(sendOTP()).unwrap();
  }
);

export const testConnection = createAsyncThunk(
  "auth/testConnection",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/api/test`);
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue({
        message: "Cannot connect to backend server",
        details: error.message,
      });
    }
  }
);

export const rehydrateAuthFromStorage = () => (dispatch) => {
  const token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user && refreshToken) {
    dispatch(setAuth({ token, user, refreshToken }));
    socket.auth = { token };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthLoaded = true;

      if (state.token) localStorage.setItem("authToken", state.token);
      if (state.refreshToken)
        localStorage.setItem("refreshToken", state.refreshToken);
      if (state.user) localStorage.setItem("user", JSON.stringify(state.user));

      if (action.payload.token) {
        socket.auth = { token: action.payload.token };
        socket.connect();
      }
    },

    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },

    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },

    setCountryCode: (state, action) => {
      state.countryCode = action.payload;
    },

    setOtp: (state, action) => {
      state.otp = action.payload;
    },

    setResendTimer: (state, action) => {
      state.resendTimer = action.payload;
    },

    clearMessages: (state) => {
      state.error = "";
      state.success = "";
      state.debugInfo = "";
    },

    setOtpAndClear: (state, action) => {
      state.otp = action.payload;
      state.error = "";
      state.success = "";
      state.debugInfo = "";
    },

    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    logoutUser: (state) => {
      socket.disconnect();

      state.user = null;
      state.token = null;
      state.sessionId = "";
      state.phoneNumber = "";
      state.otp = "";
      state.success = "";
      state.error = "";
      state.sessionExpired = false;

      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },

    resetOtpState: (state) => {
      state.otp = "";
      state.sessionId = "";
      state.generatedOtpForTest = "";
      state.error = "";
      state.success = "";
      state.resendTimer = 0;
    },

    updateProfilePic: (state, action) => {
      if (state.user) {
        state.user.profilePic = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
      state.user = null;
      state.token = null;
      state.refreshToken = null;

      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },

    setSessionRestoring: (state, action) => {
      state.sessionRestoring = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
        try {
          const fullPhone = formatPhoneNumber(
            state.countryCode,
            state.phoneNumber
          );
          state.debugInfo = `Sending OTP to: ${fullPhone}`;
        } catch (error) {
          state.debugInfo = `Phone format error: ${error.message}`;
        }
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        state.error = ""; // Clear any existing errors
        state.success = "Login successful!";
        state.sessionId = action.payload.sessionId || "";
        state.user = action.payload.user || null;
        state.token = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || null;

        // Update localStorage
        if (state.token) {
          localStorage.setItem("authToken", state.token);
        }
        if (state.refreshToken) {
          localStorage.setItem("refreshToken", state.refreshToken);
        }
        if (state.user) {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })

      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "OTP sent successfully!";
        state.sessionId = action.payload.sessionId || "";
        if (process.env.NODE_ENV === "development" && action.payload.otp) {
          state.generatedOtpForTest = action.payload.otp;
        }
      })

      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.message || "Failed to send OTP";
        state.sessionId = "";
        state.generatedOtpForTest = "";
      })

      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.isVerifying = true;
        state.error = "";
        state.success = "";
      })

      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.token = null;
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        state.error = action.payload?.message || "Failed to refresh token";
      })

      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        const payload = action.payload || {};
        let errorMessage = payload.message || "OTP verification failed";
        if (payload.status) errorMessage += ` (HTTP ${payload.status})`;
        state.error = errorMessage;
      })

      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = "";
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "OTP resent successfully!";
        state.resendTimer = action.payload.resendTimer || 60;
        state.sessionId = action.payload.sessionId || "";
        if (process.env.NODE_ENV === "development" && action.payload.otp) {
          state.generatedOtpForTest = action.payload.otp;
        }
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.message || "Failed to resend OTP";
      })

      .addCase(testConnection.fulfilled, (state, action) => {
        state.success = "Backend connection successful!";
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.error = "Cannot connect to backend server";
      })

      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload;
        localStorage.setItem("authToken", action.payload);
        state.success = "Access token refreshed";

        socket.auth.token = action.payload;

        if (socket.connected) {
          socket.disconnect();
        }
        socket.connect();
      });
  },
});

export const {
  setCurrentStep,
  setPhoneNumber,
  setCountryCode,
  setOtp,
  setResendTimer,
  clearMessages,
  setOtpAndClear,
  setUser,
  setAuth,
  logoutUser,
  resetOtpState,
  updateProfilePic,
  setSessionExpired,
  setSessionRestoring,
} = authSlice.actions;

export default authSlice.reducer;
