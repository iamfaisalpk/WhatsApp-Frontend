// import React, { useState, useEffect, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import axios from "axios";
// import { Pencil, UserCircle, X, Check } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { setUser } from "../store/slices/authSlice";

// const baseURL = import.meta.env.VITE_API_URL;

// const UserProfile = () => {
//     const { token, user } = useSelector((state) => state.auth);
//     const dispatch = useDispatch();

//     const [editName, setEditName] = useState(false);
//     const [editAbout, setEditAbout] = useState(false);
//     const [name, setName] = useState(user?.name || "");
//     const [about, setAbout] = useState(user?.about || "");
//     const [preview, setPreview] = useState(user?.profilePic);
//     const [loadingStates, setLoadingStates] = useState({
//     image: false,
//     profile: false,
// });

// useEffect(() => {
//     return () => {
//         if (preview && preview.startsWith('blob:')) {
//         URL.revokeObjectURL(preview);
//     }
//     };
// }, [preview]);

// useEffect(() => {
//     if (user) {
//         setName(user.name || "");
//         setAbout(user.about || "");
//         setPreview(user.profilePic);
//     }
// }, [user]);

//     const isValidName = name.trim().length > 0 && name.trim().length <= 25;
//     const isValidAbout = about.trim().length <= 139; 
//     const hasChanges = name !== (user?.name || "") || about !== (user?.about || "");

// const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//         toast.error("Please select a valid image file");
//         return;
//     }

//     if (file.size > 5 * 1024 * 1024) { 
//         toast.error("Image size should be less than 5MB");
//         return;
//     }

//     if (preview && preview.startsWith('blob:')) {
//         URL.revokeObjectURL(preview);
//     }

//     const newPreview = URL.createObjectURL(file);
//     setPreview(newPreview);

//     const formData = new FormData();
//     formData.append("profilePic", file);

//     try {
//         setLoadingStates(prev => ({ ...prev, image: true }));
//         const response = await axios.put(`${baseURL}/api/profile/update`, formData, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//         },
//         });

//         dispatch(setUser(response.data.user));
//         toast.success("Profile picture updated successfully!");
//     } catch (error) {
//         setPreview(user?.profilePic);
//         URL.revokeObjectURL(newPreview);
        
//         const errorMsg = error.response?.data?.message || "Failed to update profile picture";
//         toast.error(errorMsg);
//         console.error("Image update error:", error);
//     } finally {
//         setLoadingStates(prev => ({ ...prev, image: false }));
//     }
// };

// const handleProfileUpdate = async () => {
//     if (!isValidName) {
//         toast.error("Name must be between 1-25 characters");
//         return;
//     }

//     if (!isValidAbout) {
//         toast.error("About must be 139 characters or less");
//         return;
//     }

//     if (!hasChanges) {
//         setEditName(false);
//         setEditAbout(false);
//         return;
//     }

//     const formData = new FormData();
//     formData.append("name", name.trim());
//     formData.append("about", about.trim());

//     try {
//         setLoadingStates(prev => ({ ...prev, profile: true }));
//         const response = await axios.put(`${baseURL}/api/profile/update`, formData, {
//         headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//         },
//     });
    
//         dispatch(setUser(response.data.user));
//         toast.success("Profile updated successfully!");
//         setEditName(false);
//         setEditAbout(false);
//     } catch (error) {
//         const errorMsg = error.response?.data?.message || "Failed to update profile";
//         toast.error(errorMsg);
//         console.error("Profile update error:", error);
//     } finally {
//     setLoadingStates(prev => ({ ...prev, profile: false }));
//     }
// };

// const handleKeyPress = (e, field) => {
//     if (e.key === 'Enter') {
//         handleProfileUpdate();
//     }
//     if (e.key === 'Escape') {
//         setName(user?.name || "");
//         setAbout(user?.about || "");
//         setEditName(false);
//         setEditAbout(false);
//     }
// };

// const handleCancelEdit = () => {
//     setName(user?.name || "");
//     setAbout(user?.about || "");
//     setEditName(false);
//     setEditAbout(false);
// };

// const resetImage = () => {
//     if (preview && preview.startsWith('blob:')) {
//     URL.revokeObjectURL(preview);
//     }
//     setPreview(user?.profilePic);
//     toast.info("Image reset to original");
// };

// return (
//     <div className="flex bg-[#161717] min-h-screen text-white font-sans">
//     <ToastContainer position="top-center" autoClose={3000} theme="dark" />

//         {/* Left Panel */}
//     <div className="w-[420px] border-r border-l border-white/15 px-4 sm:px-6 py-5 space-y-6">
//         <h2 className="text-2xl font-semibold">Profile</h2>

//         {/* Profile Image */}
//         <div className="flex justify-center relative group">
//         <img
//             src={preview || "/default-avatar.png"}
//             alt={`${user?.name || 'User'}'s profile picture`}
//             className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#2a3942] shadow-lg"
//             onError={(e) => {
//             e.target.src = "/default-avatar.png";
//             }}
//         />

//         {loadingStates.image && (
//             <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
//             <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
//             </div>
//         )}

//         <label
//             className="absolute bottom-2 right-18 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full p-2 cursor-pointer shadow-md transition-colors duration-200 focus-within:ring-2 focus-within:ring-[#00a884] focus-within:ring-offset-2 focus-within:ring-offset-[#161717]"
//             title="Change Profile Picture"
//             role="button"
//             tabIndex={0}
//         >
//             <input
//                 type="file"
//                 className="hidden"
//                 onChange={handleImageChange}
//                 accept="image/*"
//                 disabled={loadingStates.image}
//                 aria-label="Upload profile picture"
//             />
//             <Pencil className="text-white" size={16} />
//         </label>

//         {preview !== user?.profilePic && !loadingStates.image && (
//             <button
//                 onClick={resetImage}
//                 className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 text-xs font-medium shadow-md transition-colors duration-200"
//                 title="Reset to original image"
//                 aria-label="Reset profile picture"
//             >
//             <X size={14} />
//             </button>
//         )}
//         </div>

//         {/* Name */}
//         <div>
//         <p className="text-sm text-gray-400 mb-1">Your name</p>
//         <div className="flex items-center justify-between">
//             {editName ? (
//             <div className="flex-1 mr-2">
//                 <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     onKeyDown={(e) => handleKeyPress(e, 'name')}
//                     className={`bg-transparent border-b-2 ${
//                     isValidName ? 'border-[#00a884]' : 'border-red-500'
//                 } text-white w-full outline-none text-lg pb-1`}
//                     maxLength={25}
//                     autoFocus
//                     aria-label="Edit your name"
//                 />
//                 <div className="flex justify-between items-center mt-1">
//                 <span className={`text-xs ${isValidName ? 'text-gray-500' : 'text-red-400'}`}>
//                     {name.length}/25 characters
//                 </span>
//                 </div>
//             </div>
//             ) : (
//             <p className="text-lg sm:text-xl font-semibold flex-1">{user?.name}</p>
//             )}
            
//             <div className="flex items-center space-x-2">
//             {editName ? (
//                 <>
//                 <button
//                     onClick={handleCancelEdit}
//                     className="text-gray-400 hover:text-gray-300 p-1"
//                     title="Cancel editing"
//                     aria-label="Cancel editing name"
//                 >
//                     <X size={18} />
//                 </button>
//                 <button
//                     onClick={handleProfileUpdate}
//                     disabled={!isValidName || loadingStates.profile}
//                     className="text-[#00a884] hover:text-[#00a884]/80 p-1 disabled:opacity-50"
//                     title="Save changes"
//                     aria-label="Save name changes"
//                 >
//                     <Check size={18} />
//                 </button>
//                 </>
//             ) : (
//                 <button
//                     onClick={() => setEditName(true)}
//                     className="text-gray-400 hover:text-gray-300 p-1"
//                     title="Edit name"
//                     aria-label="Edit your name"
//                 >
//                 <Pencil size={18} className="cursor-pointer" />
//                 </button>
//             )}
//             </div>
//             </div>
//             <p className="text-xs sm:text-sm text-gray-500 mt-1">
//             This name will be visible to your WhatsApp contacts.
//         </p>
//         </div>

//         {/* About */}
//         <div>
//             <p className="text-sm text-gray-400 mb-1">About</p>
//             <div className="flex items-center justify-between">
//             {editAbout ? (
//             <div className="flex-1 mr-2">
//                 <input
//                     type="text"
//                     value={about}
//                     onChange={(e) => setAbout(e.target.value)}
//                     onKeyDown={(e) => handleKeyPress(e, 'about')}
//                     className={`bg-transparent border-b-2 ${
//                     isValidAbout ? 'border-[#00a884]' : 'border-red-500'
//                 } text-white w-full outline-none text-base pb-1`}
//                     maxLength={139}
//                     autoFocus
//                     aria-label="Edit your about"
//                 />
//                 <div className="flex justify-between items-center mt-1">
//                 <span className={`text-xs ${isValidAbout ? 'text-gray-500' : 'text-red-400'}`}>
//                     {about.length}/139 characters
//                 </span>
//                 </div>
//             </div>
//             ) : (
//             <p className="text-base flex-1">{user?.about || about}</p>
//             )}
            
//             <div className="flex items-center space-x-2">
//             {editAbout ? (
//                 <>
//                 <button
//                     onClick={handleCancelEdit}
//                     className="text-gray-400 hover:text-gray-300 p-1"
//                     title="Cancel editing"
//                     aria-label="Cancel editing about"
//                 >
//                     <X size={18} />
//                 </button>
//                 <button
//                     onClick={handleProfileUpdate}
//                     disabled={!isValidAbout || loadingStates.profile}
//                     className="text-[#00a884] hover:text-[#00a884]/80 p-1 disabled:opacity-50"
//                     title="Save changes"
//                     aria-label="Save about changes"
//                 >
//                     <Check size={18} />
//                 </button>
//                 </>
//             ) : (
//                 <button
//                     onClick={() => setEditAbout(true)}
//                     className="text-gray-400 hover:text-gray-300 p-1"
//                     title="Edit about"
//                     aria-label="Edit your about"
//                 >
//                     <Pencil size={18} className="cursor-pointer" />
//                 </button>
//             )}
//             </div>
//         </div>
//         </div>

//         {/* Save Button - Only show if both fields are being edited */}
//         {(editName && editAbout) && (
//         <div className="flex space-x-3">
//             <button
//                 onClick={handleCancelEdit}
//                 disabled={loadingStates.profile}
//                 className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-full font-medium disabled:opacity-50 transition-colors duration-200"
//             >
//                 Cancel
//             </button>
//             <button
//                 onClick={handleProfileUpdate}
//                 disabled={loadingStates.profile || !isValidName || !isValidAbout || !hasChanges}
//                 className="flex-1 bg-[#00a884] hover:bg-[#00a884]/90 text-white py-2 px-4 rounded-full font-medium disabled:opacity-50 transition-colors duration-200"
//             >
//                 {loadingStates.profile ? (
//                 <div className="flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
//                     Saving...
//                 </div>
//                 ) : (
//                 "Save Changes"
//                 )}
//             </button>
//             </div>
//         )}
//         </div>

//         {/* Right Panel */}
//         <div className="hidden lg:flex flex-1 items-center justify-center text-[#667781]">
//         <div className="flex flex-col items-center">
//             <UserCircle size={100} className="text-[#667781]" />
//             <p className="text-2xl mt-4">Profile</p>
//             <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
//             Update your profile information and manage your WhatsApp settings
//             </p>
//         </div>
//         </div>
//     </div>
//     );
// };

// export default UserProfile;


import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pencil, UserCircle, X, Check } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setUser } from "../store/slices/authSlice";
import authAxios from "../Services/axiosInstance";


const UserProfile = () => {
  const { token: reduxToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const localToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const token = reduxToken || localToken;

  const [editName, setEditName] = useState(false);
  const [editAbout, setEditAbout] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "");
  const [preview, setPreview] = useState(user?.profilePic);
  const [loadingStates, setLoadingStates] = useState({ image: false, profile: false });

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!user) return;
    if (user.name !== name) setName(user.name || "");
    if (user.about !== about) setAbout(user.about || "");
    if (user.profilePic !== preview) setPreview(user.profilePic);
  }, [user]);

  const isValidName = name.trim().length > 0 && name.trim().length <= 25;
  const isValidAbout = about.trim().length <= 139;
  const hasChanges = name !== (user?.name || "") || about !== (user?.about || "");

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    const newPreview = URL.createObjectURL(file);
    setPreview(newPreview);

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setLoadingStates((prev) => ({ ...prev, image: true }));

      const response = await authAxios.put(`/api/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setUser(response.data.user));
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      setPreview(user?.profilePic);
      if (newPreview.startsWith("blob:")) URL.revokeObjectURL(newPreview);
      const errorMsg = error.response?.data?.message || "Failed to update profile picture";
      toast.error(errorMsg);
      console.error("Image update error:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, image: false }));
    }
  };

  const handleProfileUpdate = async () => {
    if (!isValidName) return toast.error("Name must be 1–25 characters");
    if (!isValidAbout) return toast.error("About must be 139 characters or less");
    if (!hasChanges) {
      setEditName(false);
      setEditAbout(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("about", about.trim());

    try {
      setLoadingStates((prev) => ({ ...prev, profile: true }));

      const response = await authAxios.put(`/api/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(setUser(response.data.user));
      toast.success("Profile updated successfully!");
      setEditName(false);
      setEditAbout(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
      console.error("Profile update error:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleProfileUpdate();
    if (e.key === "Escape") handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setAbout(user?.about || "");
    setEditName(false);
    setEditAbout(false);
  };

  const resetImage = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(user?.profilePic);
    toast.info("Image reset to original");
  };

  return (
    <div className="flex bg-[#161717] min-h-screen text-white font-sans">
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />

      <div className="w-[420px] border-r border-white/15 px-6 py-5 space-y-6">
        <h2 className="text-2xl font-semibold">Profile</h2>

        {/* Profile Image */}
        <div className="flex justify-center relative group">
          <img
            src={preview || "/default-avatar.png"}
            alt="Profile"
            className="w-40 h-40 rounded-full object-cover border-4 border-[#2a3942] shadow-lg"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          {loadingStates.image && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
            </div>
          )}
          <label className="absolute bottom-2 right-18 bg-[#00a884] hover:bg-[#00a884]/90 rounded-full p-2 cursor-pointer shadow-md">
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
              disabled={loadingStates.image}
            />
            <Pencil className="text-white" size={16} />
          </label>
          {preview !== user?.profilePic && !loadingStates.image && (
            <button
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
              title="Reset"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Name Field */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Your Name</p>
          <div className="flex items-center justify-between">
            {editName ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`bg-transparent border-b-2 ${
                  isValidName ? "border-[#00a884]" : "border-red-500"
                } text-white w-full outline-none text-lg pb-1`}
                maxLength={25}
                autoFocus
              />
            ) : (
              <p className="text-lg font-semibold">{user?.name}</p>
            )}
            <div className="flex space-x-2">
              {editName ? (
                <>
                  <button onClick={handleCancelEdit}><X size={18} /></button>
                  <button onClick={handleProfileUpdate} disabled={!isValidName}>
                    <Check size={18} className="text-[#00a884]" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditName(true)}><Pencil size={18} /></button>
              )}
            </div>
          </div>
        </div>

        {/* About Field */}
        <div>
          <p className="text-sm text-gray-400 mb-1">About</p>
          <div className="flex items-center justify-between">
            {editAbout ? (
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`bg-transparent border-b-2 ${
                  isValidAbout ? "border-[#00a884]" : "border-red-500"
                } text-white w-full outline-none text-base pb-1`}
                maxLength={139}
                autoFocus
              />
            ) : (
              <p className="text-base">{user?.about || about}</p>
            )}
            <div className="flex space-x-2">
              {editAbout ? (
                <>
                  <button onClick={handleCancelEdit}><X size={18} /></button>
                  <button onClick={handleProfileUpdate} disabled={!isValidAbout}>
                    <Check size={18} className="text-[#00a884]" />
                  </button>
                </>
              ) : (
                <button onClick={() => setEditAbout(true)}><Pencil size={18} /></button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center text-[#667781]">
        <div className="text-center">
          <UserCircle size={100} className="mx-auto" />
          <p className="text-2xl mt-4">Profile</p>
          <p className="text-sm text-gray-500 mt-2">Update your profile information and settings.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
