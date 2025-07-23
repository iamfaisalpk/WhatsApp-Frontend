import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaWhatsapp,
  FaCheck,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaShieldAlt,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-r from-[#25d366] to-[#20c758] p-3 rounded-full shadow-lg">
          <FaWhatsapp className="text-white text-xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">WhatsApp</h1>
      </div>

      {/* Card */}
      <div className="bg-white border-0 rounded-2xl w-full max-w-md p-8 shadow-xl shadow-gray-200/50 backdrop-blur-sm">
        {/* Security Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-50 border border-green-200 rounded-full px-4 py-2 flex items-center space-x-2">
            <FaShieldAlt className="text-green-600 text-sm" />
            <span className="text-green-700 text-xs font-medium">Secure Verification</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-3">
          Verify your phone number
        </h2>
        <p className="text-sm text-gray-600 text-center mb-8 leading-relaxed">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-gray-800">
            {countryCode} {phoneNumber}
          </span>
        </p>

        {/* OTP Boxes */}
        <div className="flex justify-center space-x-3 mb-6">
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
              className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold outline-none transition-all duration-300 transform
                ${error ? "border-red-300 bg-red-50 shake" : "border-gray-200"}
                ${
                  loading || isVerifying
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-4 focus:ring-green-100 focus:border-green-400 hover:border-green-300"
                }
                ${otp[idx] ? "bg-green-50 border-green-400 scale-105 shadow-md" : "hover:shadow-sm"}
              `}
            />
          ))}
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm space-x-3 animate-slideIn">
            <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && success !== "Login successful!" && (
          <div className="flex items-center bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm space-x-3 animate-slideIn">
            <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Test OTP (Enhanced Design) */}
        {generatedOtpForTest &&
          import.meta.env.VITE_SHOW_TEST_OTP === "true" && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-center text-sm mb-4 shadow-sm">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Development OTP:</span>
                <span className="font-mono font-bold text-lg bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-sm">
                  {generatedOtpForTest}
                </span>
              </div>
            </div>
          )}

        {/* Verify Button */}
        <button
          onClick={handleManualVerify}
          disabled={isVerifyDisabled}
          className="w-full bg-gradient-to-r from-[#25d366] to-[#20c758] hover:from-[#20c758] hover:to-[#1da851] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold flex items-center justify-center mt-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] shadow-md"
        >
          {loading || isVerifying ? (
            <div className="flex items-center space-x-3">
              <FaSpinner className="animate-spin text-lg" />
              <span className="text-lg">Verifying...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <FaCheck className="text-lg" />
              <span className="text-lg">Verify Code</span>
            </div>
          )}
        </button>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-500 mt-8 space-y-3">
          <button
            onClick={handleChangePhoneNumber}
            disabled={loading || isVerifying}
            className="text-[#25d366] hover:text-[#20c758] hover:underline font-medium disabled:text-gray-400 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>←</span>
            <span>Change phone number</span>
          </button>
          
          <div className="flex items-center justify-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-4 text-xs text-gray-400">or</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {resendTimer > 0 ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <p className="text-gray-400 font-medium">Resend code in {resendTimer}s</p>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading || isVerifying}
              className="text-[#25d366] hover:text-[#20c758] hover:underline font-semibold disabled:text-gray-400 transition-all duration-200 hover:scale-105"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {/* Bottom Trust Indicator */}
      <div className="mt-8 flex items-center space-x-2 text-xs text-gray-400">
        <FaShieldAlt className="text-green-500" />
        <span>Your phone number is safe and secure</span>
      </div>
    </div>
  );
};

export default OTPInput;