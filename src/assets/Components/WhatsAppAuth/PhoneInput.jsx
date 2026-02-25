import React, { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaArrowRight, FaLock } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  setPhoneNumber,
  setCountryCode,
  sendOTP,
  setCurrentStep,
  setIsoCode,
} from "../../store/slices/authSlice";

const PhoneInputComponent = ({ setStep }) => {
  const dispatch = useDispatch();
  const { phoneNumber, countryCode, isoCode, loading, error } = useSelector(
    (state) => state.auth,
  );

  // Debounced phone number validation
  // Per-country validation logic
  const isValidPhone = useMemo(() => {
    if (!phoneNumber) return false;
    const digits = phoneNumber.replace(/\D/g, "");

    // If dial code is missing or too short, it's invalid
    if (!countryCode) return false;
    const dialDigits = countryCode.replace(/\D/g, "");

    // India validation: dial code (91) + 10 digits = 12 total digits
    if (isoCode === "in" || dialDigits === "91") {
      return digits.length === dialDigits.length + 10;
    }

    // Default validation for other countries: dial code + at least 8 digits
    return digits.length >= dialDigits.length + 8 && digits.length <= 15;
  }, [phoneNumber, isoCode, countryCode]);

  // Optimized phone change handler with minimal logging
  const handlePhoneChange = useCallback(
    (value, country) => {
      // Only log significant changes (not every keystroke)
      if (value.length % 3 === 0 || value.length < 3) {
        console.log(" Phone updated:", value.slice(-4).padStart(4, "*"));
      }
      dispatch(setPhoneNumber(value));
      dispatch(setCountryCode("+" + country.dialCode));
      dispatch(setIsoCode(country.countryCode));
    },
    [dispatch],
  );

  const handlePhoneSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!phoneNumber || phoneNumber.trim() === "") {
        dispatch({
          type: "auth/sendOTP/rejected",
          payload: { message: "Please enter a phone number" },
        });
        return;
      }

      const rawPhone = phoneNumber.replace(/\D/g, "");

      if (rawPhone.length < 12 || rawPhone.length > 15) {
        dispatch({
          type: "auth/sendOTP/rejected",
          payload: { message: "Please enter a valid phone number" },
        });
        return;
      }

      const cleanPhone = `+${rawPhone}`;

      console.log(" Sending OTP to:", cleanPhone.replace(/\d(?=\d{4})/g, "*"));

      dispatch(sendOTP({ phone: cleanPhone }))
        .unwrap()
        .then(() => {
          console.log(" OTP sent successfully");
          dispatch(setCurrentStep("otp"));
        })
        .catch((error) => {
          console.error(" OTP sending failed:", error);
        });
    },
    [phoneNumber, dispatch],
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center mb-8">
        <div className="w-12 h-12 mr-3 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center">
          <img
            src="/WhatsApp.svg.png"
            alt=""
            className="w-10 h-10 object-contain"
          />
        </div>
        <h1 className="text-4xl font-light text-gray-800">PK.Chat</h1>
      </div>

      {/* Download Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 w-full max-w-md flex items-center justify-between">
        <div>
          <p className="text-gray-800 font-medium text-sm">
            Download PK.Chat for Windows
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Make calls, share your screen and get a faster experience when you
            download the Windows app.
          </p>
        </div>
        <button className="bg-[#25d366] hover:bg-[#20c659] text-white font-medium px-4 py-1 rounded-full text-xs transition-colors">
          Download
        </button>
      </div>

      {/* Phone Input Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
        <h2 className="text-xl text-gray-800 font-light mb-2 text-center">
          Enter phone number
        </h2>
        <p className="text-xs text-gray-500 text-center mb-4">
          Select a country and enter your phone number.
        </p>

        <PhoneInput
          country={"in"}
          value={phoneNumber}
          onChange={handlePhoneChange}
          inputClass="!w-full !p-3 !text-base !border !border-gray-300 !rounded-md focus:!border-[#25d366] focus:!ring-0 !outline-none"
          buttonClass="!bg-white !border !border-gray-300 !rounded-l hover:!bg-gray-100"
          dropdownClass="!bg-white !border !border-gray-300 !shadow-md !rounded"
          placeholder="Phone number"
          enableSearch
          searchPlaceholder="Search"
          countryCodeEditable={false}
          autoFormat={true}
          disableDropdown={false}
        />

        {/* Debug info - only show when needed */}
        {import.meta.env.NODE_ENV === "development" && phoneNumber && (
          <div className="text-xs text-gray-400 mt-1">
            Debug: Length {phoneNumber.replace(/\D/g, "").length} | Valid:{" "}
            {isValidPhone ? "✅" : "❌"}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-2">
            <p className="text-red-600 text-xs text-center">{error}</p>
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={handlePhoneSubmit}
          disabled={loading || !isValidPhone}
          className="w-full bg-[#25d366] hover:bg-[#20c659] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-full font-medium text-base flex items-center justify-center mt-4 transition-colors"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending OTP...
            </div>
          ) : (
            <>
              Next <FaArrowRight className="ml-2 text-sm" />
            </>
          )}
        </button>

        {/* QR Code Login */}
        <button
          onClick={() => setStep("qr")}
          className="block mx-auto mt-4 text-[#25d366] hover:text-[#20c659] text-xs font-medium cursor-pointer transition-colors"
        >
          Log in with QR code
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>
          Don&apos;t have a PK.Chat account?{" "}
          <Link
            to="/signup"
            className="text-[#25d366] hover:underline font-medium"
          >
            Get started
          </Link>
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
