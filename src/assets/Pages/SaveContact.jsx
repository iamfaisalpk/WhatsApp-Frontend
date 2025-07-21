import React, { useState } from "react";
import { toast } from "react-hot-toast";
import instance from "../Services/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../store/slices/chatSlice"; 


const SaveContact = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
    const { chats } = useSelector((state) => state.chat);


  const validatePhone = (number) => {
    // Remove any non-digit characters for validation
    const cleanNumber = number.replace(/\D/g, '');
    // Accept 10-digit numbers or 11-digit numbers starting with 1
    const phoneRegex = /^([1]?[0-9]{10})$/;
    return phoneRegex.test(cleanNumber);
  };

  const validateName = (name) => {
    // Check if name contains only letters, spaces, and common punctuation
    const nameRegex = /^[a-zA-Z\s'.-]+$/;
    return nameRegex.test(name.trim()) && name.trim().length >= 2;
  };

  const formatPhoneNumber = (number) => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    // Limit to 11 digits
    return digits.slice(0, 11);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters, spaces, and common name punctuation
    if (value === '' || /^[a-zA-Z\s'.-]*$/.test(value)) {
      setName(value);
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSave = async () => {
  const trimmedName = name.trim();
  const trimmedPhone = phoneNumber.trim();

  if (!trimmedName || !trimmedPhone) {
    return toast.error("Please enter both name and phone number");
  }

  if (!validateName(trimmedName)) {
    return toast.error("Please enter a valid name (at least 2 characters, letters only)");
  }

  if (!validatePhone(trimmedPhone)) {
    return toast.error("Enter a valid 10-digit phone number");
  }

  if (!user?._id) {
    return toast.error("User authentication required");
  }

  setIsLoading(true);

  try {
    const res = await instance.post("/api/users/save-contact", {
      name: trimmedName,
      phone: trimmedPhone,
      savedBy: user._id,
    });

    toast.success(res.data.message || "Contact saved successfully!");

    setName("");
    setPhoneNumber("");

    if (onContactSaved) {
      onContactSaved();
    }

  } catch (err) {
    console.error("Error saving contact:", err);

    if (err.response?.status === 409) {
  toast.error("Contact already exists");

  const existingChat = chats.find((chat) =>
  chat.users?.some((u) =>
    u.phone?.replace(/\D/g, "") === trimmedPhone ||
    u.name?.toLowerCase().trim() === trimmedName.toLowerCase()
  )
);


  if (existingChat) {
    dispatch(setSelectedChat(existingChat));
    toast.success("Opening existing chat...");
  }
}
    else if (err.response?.status === 401) {
      toast.error("Please log in again");
    } else {
      toast.error(err?.response?.data?.message || "Failed to save contact");
    }
  } finally {
    setIsLoading(false);
  }
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-green-700 text-center mb-6">
        Add New Contact
      </h2>

      <div className="mb-5">
        <label className="text-gray-600 block mb-1" htmlFor="name">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          placeholder="name"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          value={name}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          maxLength={50}
          autoComplete="name"
        />
      </div>

      <div className="mb-6">
        <label className="text-gray-600 block mb-1" htmlFor="phone">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="your number"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          maxLength={11}
          autoComplete="tel"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter 10-digit phone number
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isLoading || !name.trim() || !phoneNumber.trim()}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          "Save Contact"
        )}
      </button>
    </div>
  );
};

export default SaveContact;