import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


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
};

// Async thunk: Send OTP
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ phone }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: 'Network error. Please check your backend server.',
        details: error.message,
      });
    }
  }
);

// Async thunk: Verify OTP
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      if (!phone || !otp) {
        return rejectWithValue({ message: 'Phone and OTP are required' });
      }
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data);
      return data;
    } catch (error) {
      return rejectWithValue({
        message: 'Network error. Please try again.',
        details: error.message,
      });
    }
  }
);

// Async thunk: Test backend connection
export const testConnection = createAsyncThunk(
  'auth/testConnection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/api/test');
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue({
        message: 'Cannot connect to backend server',
        details: error.message,
      });
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = '';
        state.debugInfo = `Sending OTP to: ${state.countryCode}${state.phoneNumber.replace(/^0+/, '')}`;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `OTP sent successfully to ${action.payload.phone || state.countryCode + state.phoneNumber.replace(/^0+/, '')}!`;
        state.currentStep = 'otp';
        state.resendTimer = 60;
        state.debugInfo += `\nResponse: 200 OK\n${JSON.stringify(action.payload, null, 2)}`;
        if (action.payload.sessionId) {
          state.sessionId = action.payload.sessionId;
          state.debugInfo += `\nSession ID: ${action.payload.sessionId}`;
        }
        if (action.payload.otp) {
          state.generatedOtpForTest = action.payload.otp; 
          state.debugInfo += `\n Test OTP: ${action.payload.otp}`;
        }
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to send OTP';
        state.debugInfo += `\nError: ${action.payload.message}`;
        if (action.payload.details) state.debugInfo += `\nDetails: ${action.payload.details}`;
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.isVerifying = true;
        state.error = '';
        state.success = '';
        state.debugInfo = `Verifying OTP: ${state.otp} for ${state.countryCode}${state.phoneNumber.replace(/^0+/, '')}`;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        state.success = 'Login successful!';
        state.debugInfo += `\nResponse: 200 OK\n${JSON.stringify(action.payload, null, 2)}`;
        if (action.payload.sessionId) {
          state.sessionId = action.payload.sessionId;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.isVerifying = false;
        state.error = action.payload.message || 'OTP verification failed';
        state.debugInfo += `\nError: ${action.payload.message}`;
        if (action.payload.details) state.debugInfo += `\nDetails: ${action.payload.details}`;
        if (action.payload.attemptsRemaining !== undefined)
          state.debugInfo += `\nAttempts remaining: ${action.payload.attemptsRemaining}`;
      })

      // Test backend connection
      .addCase(testConnection.fulfilled, (state, action) => {
        state.success = 'Backend connection successful!';
        state.debugInfo = `Connection test: ${JSON.stringify(action.payload, null, 2)}`;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.error = 'Cannot connect to backend server';
        state.debugInfo = `Connection test failed: ${action.payload.details}`;
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
} = authSlice.actions;

export default authSlice.reducer;
