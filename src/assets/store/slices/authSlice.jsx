import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const baseURL = import.meta.env.VITE_API_URL;


const tokenFromStorage = localStorage.getItem('authToken');
const userFromStorage = JSON.parse(localStorage.getItem('user')) || null;


const initialState = {
  currentStep: 'phone',
  phoneNumber: '',
  countryCode: '+91',
  otp: '',
  loading: false,
  isVerifying: false,
  error: '',
  success: '',
  resendTimer: 0,
  sessionId: '',
  debugInfo: '',
  generatedOtpForTest: '',
  user: null,
  isAuthLoaded: false, 
  token: tokenFromStorage,
};


const formatPhoneNumber = (countryCode, phoneNumber) => {
  const cleanPhone = phoneNumber.replace(/^0+/, '').replace(/\D/g, '');
  if (countryCode === '+91' && cleanPhone.length !== 10) {
    throw new Error(`Invalid Indian phone number. Expected 10 digits, got ${cleanPhone.length}`);
  }
  return `${countryCode}${cleanPhone}`;
};

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (_, { getState, rejectWithValue }) => {
    const { phoneNumber, countryCode } = getState().auth;

    try {
      const fullPhone = formatPhoneNumber(countryCode, phoneNumber);

      const response = await fetch(`${baseURL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Network error. Please check your backend server.',
        details: error.toString(),
      });
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (_, { getState, rejectWithValue }) => {
    const state = getState().auth;
    const { phoneNumber, countryCode, otp, sessionId, user, } = state;

    if (user) {
      return rejectWithValue({ message: 'User already verified' });
    }

    try {
      const fullPhone = formatPhoneNumber(countryCode, phoneNumber);
      const cleanOtp = otp.trim();

      if (!fullPhone) return rejectWithValue({ message: 'Phone number is required' });
      if (!cleanOtp) return rejectWithValue({ message: 'OTP is required' });
      if (cleanOtp.length !== 6) return rejectWithValue({ message: `OTP must be 6 digits (got ${cleanOtp.length})` });
      if (!/^\d{6}$/.test(cleanOtp)) return rejectWithValue({ message: 'OTP must contain only numbers' });

      const requestPayload = { phone: fullPhone, otp: cleanOtp, ...(sessionId && { sessionId }) };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(requestPayload),
});

    const data = await response.json(); 
    console.log('response otp', data);

if (!response.ok) {
  let errorMessage = data.message || 'OTP verification failed';
  if (response.status === 400) {
    if (data.message?.includes('not found') || data.message?.includes('expired')) {
      errorMessage = 'OTP has expired or is invalid. Please request a new OTP.';
    } else if (data.message?.includes('invalid')) {
      errorMessage = 'Invalid OTP. Please check and try again.';
    }
  }
  return rejectWithValue({ ...data, message: errorMessage, status: response.status });
}

return data;
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Network error. Please try again.',
        details: error.toString(),
        type: 'NETWORK_ERROR',
      });
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (_, { getState, dispatch, rejectWithValue }) => {
    dispatch(clearMessages());
    return dispatch(sendOTP()).unwrap();
  }
);

export const testConnection = createAsyncThunk(
  'auth/testConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${baseURL}/api/test`);
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue({ message: 'Cannot connect to backend server', details: error.message });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
    state.token = action.payload.token;
    state.user = action.payload.user;
    state.isAuthLoaded = true;
    if (state.token) {
      localStorage.setItem('authToken', state.token);
    }
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    }
},
    setCurrentStep: (state, action) => { state.currentStep = action.payload },
    setPhoneNumber: (state, action) => { state.phoneNumber = action.payload },
    setCountryCode: (state, action) => { state.countryCode = action.payload },
    setOtp: (state, action) => { state.otp = action.payload },
    setResendTimer: (state, action) => { state.resendTimer = action.payload },
    clearMessages: (state) => {
      state.error = '';
      state.success = '';
      state.debugInfo = '';
    },
    setOtpAndClear: (state, action) => {
      state.otp = action.payload;
      state.error = '';
      state.success = '';
      state.debugInfo = '';
    },
      setUser: (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      state.currentStep = 'phone';
      state.phoneNumber = '';
      state.otp = '';
      state.generatedOtpForTest = '';
      state.sessionId = '';
      state.success = '';
      state.error = '';
    },
    resetOtpState: (state) => {
      state.otp = '';
      state.sessionId = '';
      state.generatedOtpForTest = '';
      state.error = '';
      state.success = '';
      state.resendTimer = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
        try {
          const fullPhone = formatPhoneNumber(state.countryCode, state.phoneNumber);
          state.debugInfo = `Sending OTP to: ${fullPhone}`;
        } catch (error) {
          state.debugInfo = `Phone format error: ${error.message}`;
        }
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStep = 'otp';
        state.success = `OTP sent successfully!`;
        state.resendTimer = action.payload.resendTimer || 60;
        state.sessionId = action.payload.sessionId || '';
        if (process.env.NODE_ENV === 'development' && action.payload.otp) {
          state.generatedOtpForTest = action.payload.otp;
        }
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.message || 'Failed to send OTP';
        state.sessionId = '';
        state.generatedOtpForTest = '';
      })

      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.isVerifying = true;
        state.error = '';
        state.success = '';
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        console.log("authSlice: verifyOTP.fulfilled - full action.payload:", action.payload);
        console.log("authSlice: verifyOTP.fulfilled - action.payload.user:", action.payload.user);
        console.log("authSlice: verifyOTP.fulfilled - action.payload.token:", action.payload.token);

        state.loading = false;
        state.isVerifying = false;
        state.success = 'Login successful!'; 
        state.sessionId = action.payload.sessionId || ''; 

        state.user = action.payload.user || null; 

        state.token = action.payload.token || null;
        if (state.token) {
          localStorage.setItem('authToken', state.token); 
        } else {
          localStorage.removeItem('authToken'); 
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        const payload = action.payload || {};
        let errorMessage = payload.message || 'OTP verification failed';
        if (payload.status) errorMessage += ` (HTTP ${payload.status})`;
        state.error = errorMessage;
      })

      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'OTP resent successfully!';
        state.resendTimer = action.payload.resendTimer || 60;
        state.sessionId = action.payload.sessionId || '';
        if (process.env.NODE_ENV === 'development' && action.payload.otp) {
          state.generatedOtpForTest = action.payload.otp;
        }
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.error = payload.message || 'Failed to resend OTP';
      })

      .addCase(testConnection.fulfilled, (state, action) => {
        state.success = 'Backend connection successful!';
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.error = 'Cannot connect to backend server';
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
} = authSlice.actions;

export default authSlice.reducer;
