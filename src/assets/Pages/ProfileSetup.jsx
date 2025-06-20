import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser, logoutUser } from "../store/slices/authSlice";
import { Camera } from "lucide-react";

const baseURL = import.meta.env.VITE_API_URL;

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, phoneNumber, user } = useSelector((state) => state.auth);
  
  // Get token from storage if not in Redux
  const storageToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const authToken = token || storageToken;

  // Redirect if already has profile
  useEffect(() => {
    if (user?.name && user?.profilePic) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Check for token on mount
  useEffect(() => {
    if (!authToken) {
      navigate('/auth');
    }
  }, [authToken, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }
    
    if (!file.type.match("image.*")) {
      setError("Please select an image file");
      return;
    }
    
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!image) {
      setError("Please select a profile image");
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("profilePic", image);

      const response = await axios.put(
        `${baseURL}/api/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      dispatch(setUser(response.data.user));
      navigate("/app");
      
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        dispatch(logoutUser());
        navigate('/auth');
      } else {
        setError(
          error.response?.data?.message ||
          "Profile update failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-5"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Set up your Profile
        </h2>

        <div className="relative w-32 h-32 mx-auto">
          <img
            src={
              preview ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border border-gray-600"
          />
          <label className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 cursor-pointer hover:bg-green-600">
            <Camera className="text-white" size={18} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              required
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          readOnly
          value={phoneNumber || ""}
          className="w-full px-4 py-2 rounded bg-gray-700 text-gray-400"
        />

        <button
          type="submit"
          disabled={loading}
          className={`bg-green-500 w-full py-2 rounded hover:bg-green-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;