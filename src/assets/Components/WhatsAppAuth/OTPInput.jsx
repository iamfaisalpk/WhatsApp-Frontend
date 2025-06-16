import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaCheck, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import { setCurrentStep, setOtp, setResendTimer, setOtpAndClear, sendOTP, verifyOTP } from '../../store/slices/authSlice';

const OTPInput = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { phoneNumber, countryCode, otp, loading, error, success, resendTimer, generatedOtpForTest } = useSelector((state) => state.auth);

    const inputRefs = useRef([]);

    // Handle resend timer
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => dispatch(setResendTimer(resendTimer - 1)), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer, dispatch]);

    // Navigate to profile setup on success
    useEffect(() => {
        if (success === 'Login successful!') {
            navigate('/setup-profile');
        }
    }, [success, navigate]);

    // Auto-verify OTP after 6 digits
    useEffect(() => {
        let autoVerifyTimer;
        if (otp.length === 6) {
            autoVerifyTimer = setTimeout(() => {
                dispatch(verifyOTP());
            }, 5000);
        }
        return () => clearTimeout(autoVerifyTimer);
    }, [otp, dispatch]);

    // Handle input changes
    const handleChange = (e, idx) => {
        const { value } = e.target;
        if (/^\d*$/.test(value)) {
            const updatedOtp = otp.substring(0, idx) + value + otp.substring(idx + 1);
            dispatch(setOtp(updatedOtp));
            if (value && idx < 5) {
                inputRefs.current[idx + 1].focus();
            }
        }
    };

    //  Handle backspace
    const handleKeyDown = (e, idx) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1].focus();
        }
    };

    //  Handle Resend OTP
    const handleResend = () => {
        const fullPhone = countryCode + phoneNumber.replace(/^0+/, '');
        dispatch(sendOTP({ phone: fullPhone }));
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
                            className="w-10 h-12 border border-gray-300 rounded text-center text-lg focus:ring-2 focus:ring-[#25d366] outline-none"
                        />
                    ))}
                </div>

                {error && (
                    <div className="flex items-center bg-red-100 text-red-700 px-3 py-1.5 rounded mt-2 text-xs space-x-1">
                        <FaExclamationCircle className="text-sm" />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
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
                    onClick={() => dispatch(verifyOTP())}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-[#25d366] hover:bg-[#20c758] disabled:bg-gray-400 text-white py-2.5 rounded-md font-medium flex items-center justify-center mt-4 transition-colors"
                >
                    {loading ? (
                        <FaSpinner className="animate-spin text-sm" />
                    ) : (
                        <>
                            <FaCheck className="text-sm mr-1" /> Verify
                        </>
                    )}
                </button>

                <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
                    <button
                        onClick={() => {
                            dispatch(setCurrentStep('phone'));
                            dispatch(setOtpAndClear(''));
                        }}
                        className="text-[#25d366] hover:underline font-medium"
                    >
                        <p>← Change phone number</p>
                    </button>
                    {resendTimer > 0 ? (
                        <p>Resend code in {resendTimer}s</p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="text-[#25d366] hover:underline font-medium"
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
