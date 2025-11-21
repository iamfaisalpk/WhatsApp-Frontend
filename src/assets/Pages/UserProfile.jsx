
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
