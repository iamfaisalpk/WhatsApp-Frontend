import React, { useEffect, useRef, useState } from "react";
import instance from "../../Services/axiosInstance";
import { X, UserCircle, Camera, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const { user } = useSelector((state) => state.auth);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const nameInputRef = useRef(null);

  // Auto focus input on open
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await instance.get("/api/users", {
          params: { search: "all" },
        });
        setUsers(data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, [user._id]);

  const handleToggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      console.log("Selected file:", file);
      setGroupAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length < 1) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("members", JSON.stringify(selectedMembers));
    
    if (groupAvatar) {
      formData.append("groupAvatar", groupAvatar);
      console.log("Sending groupAvatar:", groupAvatar);
    }

    // Debug: Log what we're sending
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const { data } = await instance.post("/api/chat/group", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Group creation response:", data);
      onGroupCreated(data.group);
      onClose();
    } catch (err) {
      console.error("Group creation failed", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1e1e1e] p-6 rounded-2xl text-white shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-center">
          New Group
        </h2>

        {/* Group Avatar */}
        <div className="flex justify-center mb-4">
          <label className="cursor-pointer relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="w-20 h-20 rounded-full bg-[#2a3942] flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="Group"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera size={24} className="text-white/50" />
              )}
            </div>
          </label>
        </div>

        {/* Group Name Input */}
        <input
          ref={nameInputRef}
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          className="w-full mb-4 px-4 py-2 rounded-full bg-[#2a3942] text-white outline-none"
        />

        {/* User List */}
        <div className="max-h-48 overflow-y-auto mb-4 border-t border-[#2a3942] pt-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => handleToggleMember(u._id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-[#2a3942] ${
                selectedMembers.includes(u._id) ? "bg-[#2a3942]" : ""
              }`}
            >
              {u.profilePic ? (
                <img
                  src={u.profilePic}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-8 h-8 text-[#8696a0]" />
              )}
              <span>{u.name}</span>
            </div>
          ))}
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selectedMembers.length < 1}
          className={`w-full py-2 rounded-full text-white font-semibold transition ${
            loading || !groupName.trim() || selectedMembers.length < 1
              ? "bg-[#3e4d4d] cursor-not-allowed"
              : "bg-[#00a884] hover:bg-[#009b77]"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              Creating...
            </div>
          ) : (
            "Create Group"
          )}
        </button>
      </div>
    </div>
  );
};

export default GroupCreateModal;