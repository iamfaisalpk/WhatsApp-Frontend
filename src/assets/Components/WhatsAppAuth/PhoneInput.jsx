import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaArrowRight, FaLock } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { setPhoneNumber, setCountryCode, sendOTP } from '../../store/slices/authSlice';

const PhoneInputComponent = ({ setStep }) => {
    const dispatch = useDispatch();
    const { phoneNumber, countryCode, loading, error } = useSelector((state) => state.auth);

const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length < 10) {
    dispatch({
        type: 'auth/sendOTP/rejected',
        payload: { message: 'Please enter a valid phone number' },
        });
        return;
    }
    const fullPhone = countryCode + phoneNumber.replace(/^0+/, '');
    dispatch(sendOTP({ phone: fullPhone }));
};

return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      {/* Logo */}
    <div className="flex items-center justify-center mb-8">
        <FaWhatsapp className="text-[#25d366] text-5xl mr-2" />
        <h1 className="text-4xl font-light text-gray-800">WhatsApp</h1>
    </div>

            {/* Download Banner */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 w-full max-w-md flex items-center justify-between">
        <div>
        <p className="text-gray-800 font-medium text-sm">Download WhatsApp for Windows</p>
        <p className="text-gray-500 text-xs mt-1">Make calls, share your screen and get a faster experience when you download the Windows app.</p>
        </div>
        <button className="bg-[#25d366] hover:bg-[#20c659] text-white font-medium px-4 py-1 rounded-full text-xs transition-colors">
        Download
        </button>
    </div>

        {/* Phone Input Box */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
        <h2 className="text-xl text-gray-800 font-light mb-2 text-center">Enter phone number</h2>
        <p className="text-xs text-gray-500 text-center mb-4">Select a country and enter your phone number.</p>

        <PhoneInput
        country={'in'}
        value={phoneNumber}
        onChange={(value, countryData) => {
            dispatch(setPhoneNumber(value));
            dispatch(setCountryCode(`+${countryData.dialCode}`));
        }}
        inputClass="!w-full !p-3 !text-base !border !border-gray-300 !rounded-md focus:!border-[#25d366] focus:!ring-0 !outline-none"
        buttonClass="!bg-white !border !border-gray-300 !rounded-l hover:!bg-gray-100"
        dropdownClass="!bg-white !border !border-gray-300 !shadow-md !rounded"
        placeholder="Phone number"
        enableSearch
        searchPlaceholder="Search"
        countryCodeEditable={false}
        />

            {/* Error Message */}
        {error && <p className="text-red-600 text-xs mt-2 text-center">{error}</p>}

        {/* Next Button */}
        <button
        onClick={handlePhoneSubmit}
        disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
        className="w-full bg-[#25d366] hover:bg-[#20c659] disabled:bg-gray-300 text-white py-3 rounded-full font-medium text-base flex items-center justify-center mt-4 transition-colors"
        >
        {loading ? 'Loading...' : (
            <>
            Next <FaArrowRight className="ml-2 text-sm" />
            </>
        )}
        </button>

        {/* QR Code Login */}
        <button
        onClick={() => setStep('qr')}
        className="block mx-auto mt-4 text-[#25d366] hover:text-[#20c659] text-xs font-medium cursor-pointer"
        >
            Log in with QR code
        </button>
        </div>

            {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
        <p>
            Don&apos;t have a WhatsApp account?{' '}
            <Link to="/signup" className="text-[#25d366] hover:underline font-medium">Get started</Link>
        </p>
        <div className="flex items-center justify-center mt-2">
            <FaLock className="mr-1" />
            <span>Your personal messages are end-to-end encrypted</span>
        </div>
    </div>
    </div>
);
};

export default PhoneInputComponent;
