// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";
// import { setUser, logoutUser } from "../store/slices/authSlice";
// import { Camera } from "lucide-react";

// const baseURL = import.meta.env.VITE_API_URL;

// const ProfileSetup = () => {
//   const [name, setName] = useState("");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
  
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { token, phoneNumber, user } = useSelector((state) => state.auth);
  
//   // Get token from storage if not in Redux
//   const storageToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
//   const authToken = token || storageToken;

//   // Redirect if already has profile
//   useEffect(() => {
//     if (user?.name && user?.profilePic) {
//       navigate("/app");
//     }
//   }, [user, navigate]);

//   // Check for token on mount
//   useEffect(() => {
//     if (!authToken) {
//       navigate('/auth');
//     }
//   }, [authToken, navigate]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
    
//     if (file.size > 2 * 1024 * 1024) {
//       setError("Image must be less than 2MB");
//       return;
//     }
    
//     if (!file.type.match("image.*")) {
//       setError("Please select an image file");
//       return;
//     }
    
//     setError("");
//     setImage(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
    
//     if (!name.trim()) {
//       setError("Please enter your name");
//       return;
//     }
    
//     if (!image) {
//       setError("Please select a profile image");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const formData = new FormData();
//       formData.append("name", name.trim());
//       formData.append("profilePic", image);

//       const response = await axios.put(
//         `${baseURL}/api/profile/update`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       dispatch(setUser(response.data.user));
//       navigate("/app");
      
//     } catch (error) {
//       console.error("Profile update error:", error);
      
//       if (error.response?.status === 401) {
//         setError("Session expired. Please login again.");
//         dispatch(logoutUser());
//         navigate('/auth');
//       } else {
//         setError(
//           error.response?.data?.message ||
//           "Profile update failed. Please try again."
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 flex justify-center items-center px-4 text-white">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-sm space-y-5"
//       >
//         <h2 className="text-xl font-semibold text-center mb-4">
//           Set up your Profile
//         </h2>

//         <div className="relative w-32 h-32 mx-auto">
//           <img
//             src={
//               preview ||
//               "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
//             }
//             alt="Preview"
//             className="w-32 h-32 rounded-full object-cover border border-gray-600"
//           />
//           <label className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 cursor-pointer hover:bg-green-600">
//             <Camera className="text-white" size={18} />
//             <input
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={handleImageChange}
//               required
//             />
//           </label>
//         </div>

//         <input
//           type="text"
//           placeholder="Your Name"
//           className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />

//         <input
//           type="text"
//           readOnly
//           value={phoneNumber || ""}
//           className="w-full px-4 py-2 rounded bg-gray-700 text-gray-400"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className={`bg-green-500 w-full py-2 rounded hover:bg-green-600 transition ${
//             loading ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           {loading ? "Saving..." : "Continue"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ProfileSetup;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser, logoutUser } from "../store/slices/authSlice";
import { Camera, Check } from "lucide-react";

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
      navigate("/app", {replace: true});
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
    <div className="min-h-screen bg-[#0b141a] flex flex-col">
      {/* Header */}
      <div className="bg-[#202c33] p-4 flex items-center">
        <h1 className="text-[#e9edef] text-lg font-medium">Profile info</h1>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#0b141a] flex flex-col items-center px-8 py-12">
        <div className="text-center mb-8 max-w-md">
          <p className="text-[#8696a0] text-sm leading-relaxed">
            Please provide your name and an optional profile photo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-8">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-[#182229] border-4 border-[#182229]">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#8696a0] flex items-center justify-center">
                      <svg 
                        width="48" 
                        height="48" 
                        viewBox="0 0 212 212" 
                        fill="none"
                        className="text-[#54656f]"
                      >
                        <path 
                          fill="currentColor" 
                          d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"
                        />
                        <g clipPath="url(#clip0)">
                          <path 
                            fill="#F2F2F2" 
                            d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-6.89-4.699c-1.279-.785-2.583-1.514-3.933-2.165a75.52 75.52 0 0 0-4.57-1.849c-1.445-.492-2.931-.919-4.441-1.279a75.95 75.95 0 0 0-6.616-1.074c-1.317-.146-2.645-.236-3.973-.271C130.58 145.476 118.755 146.334 106.25 146.334c-12.506 0-24.331-.858-27.608-.271-1.328.035-2.656.125-3.973.271a75.95 75.95 0 0 0-6.616 1.074c-1.51.36-2.996.787-4.441 1.279a75.52 75.52 0 0 0-4.57 1.849 68.657 68.657 0 0 0-3.933 2.165 72.458 72.458 0 0 0-6.89 4.699 71.097 71.097 0 0 0-5.924 5.47 70.112 70.112 0 0 0-3.184 3.527 67.7 67.7 0 0 0-2.608 3.299 62.767 62.767 0 0 0-2.065 2.955c-1.963 2.891-2.874 5.849-2.874 8.755v3.958c0 3.018.849 5.1 2.874 8.478.399.665.818 1.316 1.253 1.953.435.638.894 1.261 1.376 1.87a71.036 71.036 0 0 0 3.043 3.757c1.057 1.251 2.171 2.459 3.342 3.623 1.172 1.165 2.403 2.284 3.692 3.356 1.289 1.072 2.637 2.097 4.044 3.073 1.407.976 2.873 1.904 4.398 2.781a71.466 71.466 0 0 0 4.985 2.468c.717.308 1.444.598 2.18.871.735.272 1.481.527 2.237.765.756.237 1.522.456 2.299.658.777.201 1.564.385 2.362.551.798.166 1.607.315 2.427.447.82.132 1.651.247 2.491.346.841.099 1.691.181 2.551.247.86.066 1.729.115 2.608.149.878.033 1.766.049 2.663.049.897 0 1.785-.016 2.663-.049.878-.034 1.748-.083 2.608-.149.86-.066 1.71-.148 2.551-.247.84-.099 1.671-.214 2.491-.346.82-.132 1.629-.281 2.427-.447.798-.166 1.585-.35 2.362-.551.777-.202 1.543-.421 2.299-.658.756-.238 1.502-.493 2.237-.765.736-.273 1.463-.563 2.18-.871a71.466 71.466 0 0 0 4.985-2.468c1.525-.877 2.991-1.805 4.398-2.781 1.407-.976 2.755-2.001 4.044-3.073 1.289-1.072 2.52-2.191 3.692-3.356 1.171-1.164 2.285-2.372 3.342-3.623a71.036 71.036 0 0 0 3.043-3.757c.482-.609.941-1.232 1.376-1.87.435-.637.854-1.288 1.253-1.953 2.025-3.378 2.874-5.46 2.874-8.478v-3.958c0-2.906-.911-5.864-2.874-8.755z"
                          />
                          <path 
                            fill="#DDD" 
                            d="M106.399 191.355c3.508 0 6.349-2.822 6.349-6.301 0-3.479-2.841-6.301-6.349-6.301-3.508 0-6.349 2.822-6.349 6.301 0 3.479 2.841 6.301 6.349 6.301z"
                          />
                          <ellipse 
                            cx="106.399" 
                            cy="130.359" 
                            rx="35.772" 
                            ry="35.026" 
                            fill="#DDD"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-2 right-2 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full p-3 cursor-pointer transition-colors shadow-lg">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Type your name here"
                className="w-full bg-transparent border-b-2 border-[#00a884] pb-3 pt-2 text-[#e9edef] text-lg placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] caret-[#00a884]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={25}
                required
              />
              <div className="absolute right-0 bottom-3 text-[#8696a0] text-sm">
                {name.length}/25
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-[#ff6b6b] text-sm text-center bg-[#ff6b6b]/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`bg-[#00a884] hover:bg-[#00a884]/90 disabled:bg-[#8696a0]/50 disabled:cursor-not-allowed rounded-full p-4 transition-all duration-200 ${
                loading ? "animate-pulse" : ""
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <Check size={24} className="text-white" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-[#202c33] p-4 text-center">
        <p className="text-[#8696a0] text-xs">
          Your personal messages are end-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;
