import React from "react";
import qr from "../../../assets/Screenshot 2025-06-11 114936.png";

const QRCode = ({ setStep }) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Download banner */}
      <div className="bg-white border border-gray-300 rounded-lg flex items-center justify-between p-3 md:p-4 w-full max-w-lg mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-[#25d366] text-white rounded-full p-1 flex items-center justify-center overflow-hidden w-8 h-8">
            <img
              src="/WhatsApp.svg.png"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-800 cursor-pointer">
              Download PK.Chat for Windows
            </p>
            <p className="text-[10px] md:text-xs text-gray-500">
              Make calls, share your screen and get a faster experience when you
              download the Windows app.
            </p>
          </div>
        </div>
        <button className="bg-[#25d366] hover:bg-[#20c659] text-white text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium transition-colors">
          Download
        </button>
      </div>

      {/* QR Code and steps */}
      <div className="bg-white border border-gray-300 rounded-lg flex flex-col md:flex-row w-full max-w-lg overflow-hidden">
        {/* QR Code */}
        <div className="flex-1 p-3 md:p-4 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center justify-center">
          <img
            src={qr}
            alt="QR Code"
            className="w-40 h-40 md:w-48 md:h-48 object-cover"
          />
          <button
            onClick={() => setStep("phone")}
            className="text-[#25d366] hover:text-[#20c659] text-[10px] md:text-xs font-medium mt-2 cursor-pointer"
          >
            Log in with phone number →
          </button>
        </div>

        {/* Steps */}
        <div className="flex-1 p-3 md:p-4">
          <h2 className="text-sm md:text-base font-medium text-gray-800 mb-2 md:mb-3">
            Steps to log in
          </h2>
          <ol className="text-[10px] md:text-xs text-gray-700 space-y-0.5 md:space-y-1">
            <li>1. Open PK.Chat on your phone</li>
            <li>2. On Android, tap Menu ••• or iPhone tap Settings ⚙️</li>
            <li>3. Tap Linked devices, then Link device</li>
            <li>4. Scan the QR code to confirm</li>
          </ol>
          <div className="flex items-center mt-2 md:mt-4 text-[10px] md:text-xs text-gray-500">
            <input
              type="checkbox"
              className="mr-1 accent-[#25d366]"
              defaultChecked
            />
            <span>Stay logged in on this browser</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 md:mt-6 text-[10px] md:text-xs text-gray-500 text-center">
        <p>
          Don't have a PK.Chat account?{" "}
          <span className="text-[#25d366] hover:underline font-medium cursor-pointer">
            Get started
          </span>
        </p>
        <div className="flex items-center justify-center mt-1">
          <svg
            className="w-3 h-3 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M12 20l9-5-9-5-9 5 9 5zm0-10l9-5-9-5-9 5 9 5z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Your personal messages are end-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default QRCode;
