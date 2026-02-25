import React, { useEffect, useRef, useState } from "react";
import instance from "../../Services/axiosInstance";
import { X, UserCircle, Camera, Loader2, Search, Users } from "lucide-react";
import { useSelector } from "react-redux";

const GroupCreateModal = ({ onClose, onGroupCreated }) => {
  const { user } = useSelector((state) => state.auth);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupDescription, setGroupDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const nameInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Auto focus input on open
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await instance.get("/api/users", {
          params: { search: "" }, 
        });
        setUsers(data.filter((u) => u._id !== user._id));
        setFilteredUsers(data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };

    fetchUsers();
  }, [user._id]);

  // Filter users on search
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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
    formData.append("groupDescription", groupDescription);

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
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
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

  const memberCount = selectedMembers.length;
  const isCreateDisabled = loading || !groupName.trim() || selectedMembers.length < 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-gradient-to-b from-slate-900 via-[#0a0a0a] to-[#000] border border-slate-800/50 rounded-3xl shadow-2xl shadow-[#fa6400]/20 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              New Group
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-all duration-200 group hover:scale-110"
              aria-label="Close modal"
            >
              <X size={20} className="text-slate-400 group-hover:text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Group Avatar */}
          <div className="flex justify-center">
            <label className="cursor-pointer group relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/70 border-4 border-slate-700/50 hover:border-[#fa6400]/50 transition-all duration-300 group-hover:scale-105 shadow-2xl overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Group preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-[#fa6400] transition-colors">
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs font-medium">Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
              </div>
            </label>
          </div>

          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Users size={16} />
              Group Name
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-[#fa6400] focus:outline-none focus:ring-2 focus:ring-[#fa6400]/30 transition-all duration-200 text-white placeholder-slate-500 text-base font-medium"
              maxLength={50}
            />
            <p className="text-xs text-slate-500 mt-1">{groupName.length}/50</p>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Add a description for your group..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-[#fa6400] focus:outline-none focus:ring-2 focus:ring-[#fa6400]/30 transition-all duration-200 resize-none text-white placeholder-slate-500"
              maxLength={200}
            />
          </div>

          {/* Members Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                Members ({memberCount})
              </label>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                memberCount >= 2 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-700/50 text-slate-400'
              }`}>
                {memberCount}/50
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-[#fa6400] focus:outline-none focus:ring-2 focus:ring-[#fa6400]/30 transition-all duration-200 text-white placeholder-slate-500"
              />
            </div>

            {/* Selected Members Count */}
            {memberCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMembers.map(id => {
                  const member = users.find(u => u._id === id);
                  return member ? (
                    <div key={id} className="px-3 py-1 bg-[#fa6400]/20 text-[#fa6400] text-xs font-semibold rounded-full border border-[#fa6400]/30 flex items-center gap-1">
                      {member.name.split(' ')[0]}
                      <button
                        onClick={() => handleToggleMember(id)}
                        className="ml-1 hover:bg-[#fa6400]/30 rounded-full p-0.5 -mr-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery ? 'No users found' : 'No users available'}
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleToggleMember(u._id)}
                    className={`group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-[#fa6400]/5 border border-transparent hover:border-slate-700 hover:shadow-lg ${
                      selectedMembers.includes(u._id) 
                        ? 'bg-gradient-to-r from-[#fa6400]/10 to-[#fa6400]/5 border-[#fa6400]/30 shadow-md' 
                        : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 ${
                      selectedMembers.includes(u._id) 
                        ? 'ring-2 ring-[#fa6400]/40' 
                        : 'group-hover:ring-2 group-hover:ring-slate-700/50'
                    }`}>
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={u.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-full h-full text-slate-500 group-hover:text-[#fa6400]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${
                        selectedMembers.includes(u._id) 
                          ? 'text-[#fa6400] group-hover:text-[#fa6400]' 
                          : 'text-white group-hover:text-slate-200'
                      }`}>
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">@{u.username || 'user'}</p>
                    </div>
                    {selectedMembers.includes(u._id) && (
                      <div className="w-2 h-2 bg-[#fa6400] rounded-full animate-pulse ml-auto" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={handleCreate}
            disabled={isCreateDisabled}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 transform ${
              isCreateDisabled
                ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#fa6400] to-[#e55a00] hover:from-[#ff7b00] hover:to-[#fa6400] hover:shadow-[#fa6400]/25 hover:scale-[1.02] text-white active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Group...
              </div>
            ) : (
              `Create Group${memberCount > 0 ? ` (${memberCount})` : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreateModal;
