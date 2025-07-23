import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaCheck,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import {
  setCurrentStep,
  setOtp,
  setResendTimer,
  setOtpAndClear,
  sendOTP,
  verifyOTP,
  clearMessages,
} from "../../store/slices/authSlice";

const OTPInput = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    phoneNumber,
    countryCode,
    otp,
    loading,
    isVerifying,
    error,
    success,
    resendTimer,
    generatedOtpForTest,
    user,
    token,
  } = useSelector((state) => state.auth);

  const inputRefs = useRef([]);
  const hasNavigated = useRef(false);
  const verificationAttempted = useRef(false);
  const autoVerifyTimeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  //  Resend Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => dispatch(setResendTimer(resendTimer - 1)), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, dispatch]);

  //  Reset loading if stuck
  useEffect(() => {
    if (loading || isVerifying) {
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn("⏰ Resetting stuck loading states");
        dispatch(clearMessages());
      }, 10000);
    } else {
      clearTimeout(loadingTimeoutRef.current);
    }
    return () => clearTimeout(loadingTimeoutRef.current);
  }, [loading, isVerifying, dispatch]);

  //  Handle verified → navigate
  useEffect(() => {
    if (hasNavigated.current || !token || !user || !user.phone) return;

    if (!user.name || !user.profilePic) {
      hasNavigated.current = true;
      cleanupTimeouts();
      dispatch(setOtp(""));
      dispatch(clearMessages());
      console.log(" New user → /setup-profile");
      navigate("/setup-profile", { replace: true });
    } else {
      hasNavigated.current = true;
      cleanupTimeouts();
      dispatch(setOtp(""));
      dispatch(clearMessages());
      console.log(" Existing user → /app");
      navigate("/app", { replace: true });
    }
  }, [token, user, dispatch, navigate]);

  //  Cleanup all timeouts
  const cleanupTimeouts = useCallback(() => {
    clearTimeout(autoVerifyTimeoutRef.current);
    clearTimeout(loadingTimeoutRef.current);
    autoVerifyTimeoutRef.current = null;
    loadingTimeoutRef.current = null;
  }, []);

  //  Auto verify on 6 digits
  useEffect(() => {
    if (
      otp.length === 6 &&
      !loading &&
      !isVerifying &&
      !verificationAttempted.current
    ) {
      autoVerifyTimeoutRef.current = setTimeout(() => {
        verificationAttempted.current = true;
        dispatch(verifyOTP());
      }, 500);
    }
    return () => clearTimeout(autoVerifyTimeoutRef.current);
  }, [otp, loading, isVerifying, dispatch]);

  //  Manual verify
  const handleManualVerify = useCallback(() => {
    if (otp.length === 6 && !loading && !isVerifying) {
      verificationAttempted.current = true;
      dispatch(verifyOTP());
    }
  }, [otp, loading, isVerifying, dispatch]);

  //  Handle input change
  const handleChange = useCallback(
    (e, idx) => {
      const { value } = e.target;
      if (!/^\d*$/.test(value)) return;

      const updatedOtp = otp.substring(0, idx) + value + otp.substring(idx + 1);
      dispatch(setOtp(updatedOtp));

      if (error) dispatch(clearMessages());
      if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
    },
    [otp, error, dispatch]
  );

  //  Handle backspace
  const handleKeyDown = useCallback(
    (e, idx) => {
      if (e.key === "Backspace" && !otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [otp]
  );

  //  Resend OTP
  const handleResend = useCallback(() => {
    verificationAttempted.current = false;
    cleanupTimeouts();
    dispatch(clearMessages());
    dispatch(sendOTP());
  }, [dispatch, cleanupTimeouts]);

  //  Change number
  const handleChangePhoneNumber = useCallback(() => {
    hasNavigated.current = false;
    verificationAttempted.current = false;
    cleanupTimeouts();
    dispatch(setCurrentStep("phone"));
    dispatch(setOtpAndClear(""));
    dispatch(clearMessages());
  }, [dispatch, cleanupTimeouts]);

  const isVerifyDisabled = useMemo(
    () => loading || isVerifying || otp.length !== 6,
    [loading, isVerifying, otp.length]
  );

  //  Cleanup on unmount
  useEffect(() => {
    return () => cleanupTimeouts();
  }, [cleanupTimeouts]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-[#25d366] p-2 rounded-full">
          <FaWhatsapp className="text-white text-lg" />
        </div>
        <h1 className="text-lg font-bold text-gray-800">WhatsApp</h1>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-300 rounded-lg w-full max-w-sm p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 text-center mb-2">
          Verify your phone number
        </h2>
        <p className="text-xs text-gray-600 text-center mb-4">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium">
            {countryCode} {phoneNumber}
          </span>
        </p>

        {/* OTP Boxes */}
        <div className="flex justify-center space-x-2 mb-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={otp[idx] || ""}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              disabled={loading || isVerifying}
              className={`w-10 h-12 border rounded text-center text-lg outline-none transition-all duration-200
                ${error ? "border-red-300 bg-red-50" : "border-gray-300"}
                ${
                  loading || isVerifying
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-[#25d366] focus:border-[#25d366]"
                }
                ${otp[idx] ? "bg-green-50 border-green-300" : ""}
              `}
            />
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center bg-red-100 text-red-700 px-3 py-2 rounded-md mt-2 text-xs space-x-2">
            <FaExclamationCircle className="text-sm" />
            <span>{error}</span>
          </div>
        )}
        {success && success !== "Login successful!" && (
          <div className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-md mt-2 text-xs space-x-2">
            <FaCheckCircle className="text-sm" />
            <span>{success}</span>
          </div>
        )}

        {/* Test OTP (only in dev) */}
        {generatedOtpForTest &&
          import.meta.env.VITE_SHOW_TEST_OTP === "true" && (
            <div>Test OTP: {generatedOtpForTest}</div>
          )}

        {/* Verify Button */}
        <button
          onClick={handleManualVerify}
          disabled={isVerifyDisabled}
          className="w-full bg-[#25d366] hover:bg-[#20c758] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-md font-medium flex items-center justify-center mt-4 transition-colors duration-200"
        >
          {loading || isVerifying ? (
            <div className="flex items-center space-x-2">
              <FaSpinner className="animate-spin text-sm" />
              <span>Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FaCheck className="text-sm" />
              <span>Verify</span>
            </div>
          )}
        </button>

        {/* Footer Links */}
        <div className="text-center text-xs text-gray-500 mt-4 space-y-2">
          <button
            onClick={handleChangePhoneNumber}
            disabled={loading || isVerifying}
            className="text-[#25d366] hover:text-[#20c758] hover:underline font-medium disabled:text-gray-400"
          >
            ← Change phone number
          </button>
          {resendTimer > 0 ? (
            <p className="text-gray-400">Resend code in {resendTimer}s</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading || isVerifying}
              className="text-[#25d366] hover:text-[#20c758] hover:underline font-medium disabled:text-gray-400"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
