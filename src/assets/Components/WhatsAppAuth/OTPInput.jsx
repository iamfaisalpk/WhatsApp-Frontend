import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaCheck, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { setCurrentStep, setOtp, setResendTimer, setOtpAndClear, sendOTP, verifyOTP, clearMessages, } from '../../store/slices/authSlice';

const OTPInput = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { phoneNumber, countryCode, otp, loading, isVerifying, error, success, resendTimer, generatedOtpForTest, user, token } = useSelector((state) => state.auth);

    useEffect(()=>{
        if (token){
            console.log("Token from OTPInput.jsx",token);
        }
    },[token])

    const inputRefs = useRef([]);
    const hasNavigated = useRef(false);
    const verificationAttempted = useRef(false);

useEffect(() => {
    let timer;
    if (resendTimer > 0) {
    timer = setTimeout(() => dispatch(setResendTimer(resendTimer - 1)), 1000);
    }
    return () => clearTimeout(timer);
}, [resendTimer, dispatch]);


useEffect(() => {
    let timeout;
    if (loading || isVerifying) {
    timeout = setTimeout(() => {
        dispatch(clearMessages());
        console.warn('Reset loading/isVerifying due to timeout');
    }, 10000);
    }
    return () => clearTimeout(timeout);
}, [loading, isVerifying, dispatch]);


useEffect(() => {
    if (hasNavigated.current) return;

    const isVerified = token && user && user.phone && !user.name && !user.profilePic;

if (isVerified) {
    hasNavigated.current = true;
    console.log("OTP verified & profile incomplete, navigating to /setup-profile");
    dispatch(setOtp(''));
    dispatch(clearMessages());
    navigate('/setup-profile', { replace: true });
}
}, [token, user, dispatch, navigate]);


const handleChange = (e, idx) => {
    console.log('handleChange:', e.target.value, idx); 
    const { value } = e.target;
    if (/^\d*$/.test(value)) {
        const updatedOtp = otp.substring(0, idx) + value + otp.substring(idx + 1);
        dispatch(setOtp(updatedOtp));
        if (error) {
        dispatch(clearMessages());
    }
    if (value && idx < 5) {
        inputRefs.current[idx + 1].focus();
    }
    }
};

const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
        inputRefs.current[idx - 1].focus();
    }
};

const handleManualVerify = () => {
    if (otp.length === 6 && !loading && !isVerifying) {
    verificationAttempted.current = true;
    dispatch(verifyOTP());
}
};


const handleResend = () => {
    verificationAttempted.current = false;
    dispatch(clearMessages());
    dispatch(sendOTP());
};


const handleChangePhoneNumber = () => {
    verificationAttempted.current = false;
    dispatch(setCurrentStep('phone'));
    dispatch(setOtpAndClear(''));
    dispatch(clearMessages());
};

return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-2 mb-4">
        <div className="bg-[#25d366] p-2 rounded-full">
            <FaWhatsapp className="text-white text-lg" />
        </div>
        <h1 className="text-lg font-bold text-gray-800">WhatsApp</h1>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg w-full max-w-sm p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 text-center mb-2">Verify your phone number</h2>
        <p className="text-xs text-gray-600 text-center mb-4">
            Enter the 6-digit code sent to <span className="font-medium">{countryCode} {phoneNumber}</span>
        </p>

        <div className="flex justify-center space-x-2 mb-3">
            {Array.from({ length: 6 }).map((_, idx) => (
            <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={otp[idx] || ''}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                disabled={loading || isVerifying}
                className={`w-10 h-12 border rounded text-center text-lg outline-none transition-colors
                ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                ${(loading || isVerifying || user || token) ? 'bg-gray-100 cursor-auto' : 'focus:ring-2 focus:ring-[#25d366]'}
                `}
            />
            ))}
        </div>

        {error && (
            <div className="flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded mt-2 text-xs space-x-1">
            <FaExclamationCircle className="text-sm" />
            <span>{error}</span>
            </div>
        )}
        {success && success !== 'Login successful!' && (
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded mt-2 text-xs space-x-1">
            <FaCheckCircle className="text-sm" />
            <span>{success}</span>
            </div>
        )}

        {generatedOtpForTest && (
            <div className="mt-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Test OTP: {generatedOtpForTest}
            </div>
        )}

        <button
            onClick={handleManualVerify}
            disabled={loading || isVerifying || otp.length !== 6}
            className="w-full bg-[#25d366] hover:bg-[#20c758] disabled:bg-gray-400 text-white py-2.5 rounded-md font-medium flex items-center justify-center mt-4 transition-colors"
        >
            {(loading || isVerifying) ? (
            <FaSpinner className="animate-spin text-sm" />
        ) : (
            <>
                <FaCheck className="text-sm mr-1" /> Verify
            </>
        )}
        </button>

        <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
        <button
            onClick={handleChangePhoneNumber}
            disabled={loading || isVerifying}
            className="text-[#25d366] hover:underline font-medium disabled:text-gray-400"
        >
            <p>← Change phone number</p>
            </button>
            {resendTimer > 0 ? (
            <p>Resend code in {resendTimer}s</p>
        ) : (
            <button
                onClick={handleResend}
                disabled={loading || isVerifying}
                className="text-[#25d366] hover:underline font-medium disabled:text-gray-400"
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