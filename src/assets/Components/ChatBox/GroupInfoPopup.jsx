import React, { useEffect, useState } from "react";
import {
  X,
  MessageSquare,
  Star,
  Bell,
  Shield,
  Lock,
  Trash2,
  Search,
  Crown,
  Phone,
  Video,
  Edit3,
  Camera,
  Users,
  Settings,
  LogOut,
  Share2,
  Check,
  Heart,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../Services/axiosInstance";
import { toast } from "react-hot-toast";
import { fetchChats } from "../../../../utils/chatThunks";
import InviteModal from "../../Pages/InviteModal";

const GroupInfoPopup = ({
  chat,
  onClose,
  onUpdate,
  show = true,
  showInviteModal,
  setShowInviteModal,
}) => {
  const { user: currentUser } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("members");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(
    chat?.groupDescription || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { chats } = useSelector((state) => state.chat);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  const dispatch = useDispatch();

  if (!chat || !show) return null;

  const isGroupAdmin = chat.groupAdmin?._id === currentUser._id;
  const displayedMembers = Array.from(
    new Map(
      (chat.members || []).filter((m) => m && m._id).map((m) => [m._id, m])
    ).values()
  );
  const memberCount = displayedMembers.length;

  const menuItems = [
    { icon: MessageSquare, label: "Media, links and docs", count: 0 },
    { icon: Star, label: "Starred messages" },
    { icon: Bell, label: "Mute notifications", toggle: true },
    {
      icon: Shield,
      label: "Encryption",
      subtitle: "Messages are end-to-end encrypted. Click to learn more.",
      status: "On",
    },
    { icon: Lock, label: "Advanced chat privacy", status: "Off" },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        axios
          .get(`/api/users?search=${searchQuery}`)
          .then((res) => {
            setSearchResults(res.data);
            setFilteredResults(res.data);
          })
          .catch((err) => {
            setSearchResults([]);
            setFilteredResults([]);
          });
      } else {
        setSearchResults([]);
        setFilteredResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    if (showInviteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showInviteModal]);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddSelectedUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-add", {
        chatId: chat._id,
        userId: selectedUsers,
      });

      toast.success("Users added to group");

      for (const userId of selectedUsers) {
        const { data: accessRes } = await axios.post("/api/chat", {
          userId,
        });

        const privateChatId = accessRes.chat?._id;
        const inviteToken = chat.inviteToken;
      }

      dispatch(fetchChats());
      if (onUpdate) onUpdate();
      setShowInviteModal(false);
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Add/send invite error:", err);
      toast.error("Failed to add users or send invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new group name", chat.groupName);
    if (!newName || newName === chat.groupName) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/rename", {
        chatId: chat._id,
        groupName: newName,
      });
      toast.success("Group name updated!");
      dispatch(fetchChats());
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Rename error:", err);
      toast.error("Rename failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionEdit = () => {
    setTempDescription(chat.groupDescription || "");
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    if (tempDescription.trim() === (chat.groupDescription || "")) {
      setIsEditingDescription(false);
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/api/chat/group/${chat._id}/description`, {
        description: tempDescription.trim(),
      });
      toast.success("Description updated!");
      setIsEditingDescription(false);
      dispatch(fetchChats());
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("Failed to update description");
      console.error("Description update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionCancel = () => {
    setTempDescription(chat.groupDescription || "");
    setIsEditingDescription(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Add file validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("groupAvatar", file);

    try {
      await axios.put(`/api/chat/group-avatar/${chat._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Avatar updated!");
      dispatch(fetchChats());
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Remove this user from the group?")) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-remove", {
        chatId: chat._id,
        userId,
      });
      toast.success("User removed");
      dispatch(fetchChats());
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Remove user error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to remove user";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-leave", { chatId: chat._id });
      toast.success("You left the group");
      dispatch(fetchChats());
      onClose();
    } catch (err) {
      console.error("Leave group error:", err);
      const errorMessage = err.response?.data?.message || "Leave group failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/chat/${chat._id}`);
      toast.success("Group deleted");
      dispatch(fetchChats());
      onClose();
    } catch (err) {
      console.error("Delete group error:", err);
      const errorMessage = err.response?.data?.message || "Delete failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareInvite = async () => {
    try {
      const inviteToken = chat.inviteToken;
      if (!inviteToken) {
        toast.error("Invite token not available");
        return;
      }

      const link = `${window.location.origin}/preview/${inviteToken}`;
      await navigator.clipboard.writeText(link);


      toast.success("Invite link copied to clipboard");
      setShowInviteModal(false);
    } catch (err) {
      console.error("Share invite error:", err);
      toast.error("Failed to copy invite link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }

      return (
        date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }) +
        " at " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    } catch (err) {
      console.error("Date formatting error:", err);
      return "";
    }
  };

  const getAdminName = () => {
    if (!chat?.members || !chat?.groupAdmin?._id) return "Admin";

    const admin = chat.members.find(
      (member) => member && member._id === chat.groupAdmin._id
    );

    return admin ? admin.name : "Admin";
  };

  const visibleMembers = showMoreOptions
    ? displayedMembers
    : displayedMembers.slice(0, 5);


  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="group-info-popup"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-[380px] h-full bg-[#161717] text-white shadow-lg border-l border-[#2a3942] overflow-hidden flex-shrink-0 z-20"
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="text-white">Loading...</div>
            </div>
          )}

          <div className="flex justify-between items-center p-4 border-b border-[#2a3942]">
            <h2 className="text-lg font-medium">Group info</h2>
            <X
              size={20}
              className="cursor-pointer text-gray-400 hover:text-white"
              onClick={onClose}
            />
          </div>

          <div className="overflow-y-auto h-[calc(100%-72px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Group Avatar and Name */}
            <div className="flex flex-col items-center text-center p-6 pb-4">
              <div className="relative mb-4">
                <img
                  src={chat.groupAvatar || "/default-avatar.png"}
                  alt={chat.groupName}
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#2a3942]"
                />
                {isGroupAdmin && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="group-avatar-upload"
                      style={{ display: "none" }}
                      onChange={handleAvatarUpload}
                    />
                    <div
                      className="absolute bottom-2 right-2 bg-[#00a884] rounded-full p-2 cursor-pointer hover:bg-[#00967a]"
                      onClick={() =>
                        document.getElementById("group-avatar-upload").click()
                      }
                    >
                      <Camera size={16} className="text-white" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">{chat.groupName}</h3>
                {isGroupAdmin && (
                  <Edit3
                    size={16}
                    className="text-[#8696a0] cursor-pointer hover:text-white"
                    onClick={handleRename}
                  />
                )}
              </div>
              <p className="text-sm text-[#8696a0] mb-2">
                Group • {memberCount} members
              </p>
              <p className="text-sm text-[#8696a0]">
                {chat.groupAdmin?._id === currentUser._id
                  ? "You"
                  : getAdminName()}
                {chat.createdAt && (
                  <span> on {formatDate(chat.createdAt)}</span>
                )}
              </p>
            </div>

            {/* Group Description Section */}
            <div className="px-4 py-3 border-b border-[#2a3942]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#8696a0]">Description</p>
                {isGroupAdmin && (
                  <Edit3
                    size={14}
                    className="text-[#8696a0] cursor-pointer hover:text-white"
                    onClick={handleDescriptionEdit}
                  />
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Add group description..."
                    className="w-full p-2 bg-[#2a3942] text-white rounded resize-none focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                    rows="3"
                    maxLength="512"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleDescriptionCancel}
                      className="px-3 py-1 text-sm text-[#8696a0] hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDescriptionSave}
                      className="px-3 py-1 text-sm bg-[#00a884] text-white rounded hover:bg-[#00967a]"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#e9edef]">
                  {chat.groupDescription || "No description"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-b border-[#2a3942]">
              <div className="flex justify-around">
                {[
                  {
                    icon: MessageSquare,
                    label: "Media",
                    color: "bg-[#00a884]",
                  },
                  { icon: Phone, label: "Audio", color: "bg-[#00a884]" },
                  { icon: Video, label: "Video", color: "bg-[#00a884]" },
                  { icon: Search, label: "Search", color: "bg-[#00a884]" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center space-y-2 cursor-pointer hover:bg-[#2a3942] p-3 rounded"
                  >
                    <div className={`${item.color} rounded-full p-3`}>
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-[#e9edef]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Options */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#2a3942] cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} className="text-[#8696a0]" />
                    <div>
                      <p className="text-sm text-[#e9edef]">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-xs text-[#8696a0] mt-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.count !== undefined && (
                      <span className="text-sm text-[#8696a0]">
                        {item.count}
                      </span>
                    )}
                    {item.status && (
                      <span className="text-sm text-[#8696a0]">
                        {item.status}
                      </span>
                    )}
                    {item.toggle && (
                      <div
                        className="w-10 h-6 bg-[#2a3942] rounded-full relative cursor-pointer"
                        onClick={() => setMuteNotifications((prev) => !prev)}
                      >
                        <div
                          className={`w-4 h-4 rounded-full absolute top-1 ${
                            muteNotifications
                              ? "left-5 bg-[#00a884]"
                              : "left-1 bg-[#8696a0]"
                          } transition-all`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Member List */}
            <div className="px-4 py-3 border-t border-[#2a3942]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#8696a0]">{memberCount} members</p>
                <div className="flex items-center space-x-2">
                  {isGroupAdmin && (
                    <Users
                      size={16}
                      className="text-[#8696a0] cursor-pointer hover:text-white"
                      onClick={() => setShowInviteModal(true)}
                      title="Add member"
                    />
                  )}
                  <Search size={16} className="text-[#8696a0]" />
                </div>
              </div>

              <div className="space-y-1">
                {visibleMembers.map((member) =>
                  member ? (
                    <div
                      key={member._id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-[#2a3942] cursor-pointer rounded group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={member.profilePic || "/default-avatar.png"}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {/* Online status indicator */}
                          {member.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-[#e9edef] truncate">
                              {member._id === currentUser._id
                                ? "You"
                                : member.name}
                            </p>
                            {member._id === chat.groupAdmin?._id && (
                              <span className="inline-flex items-end px-2 py-0.5 rounded-[8px] text-xs font-medium bg-gray-700 text-green-400">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8696a0] truncate">
                            {member.about || "Hey there! I am using WhatsApp"}
                          </p>
                        </div>
                      </div>

                      {isGroupAdmin && member._id !== chat.groupAdmin && (
                        <div
                          onClick={() => handleRemoveUser(member._id)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-[#2a3942] text-xs"
                        >
                          Remove
                        </div>
                      )}
                    </div>
                  ) : null
                )}
              </div>

              {/* Show more/less toggle */}
              {memberCount > 5 && (
                <div
                  className="flex items-center justify-center py-2 cursor-pointer hover:bg-[#2a3942] rounded"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                >
                  <ChevronDown
                    size={16}
                    className={`text-[#8696a0] transition-transform ${
                      showMoreOptions ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-sm text-[#8696a0] ml-2">
                    {showMoreOptions ? "Show less" : `${memberCount - 5} more`}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="px-4 py-2 border-t border-[#2a3942]">
              <button
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left"
                onClick={() => setShowInviteModal(true)}
              >
                <Share2 size={20} className="text-[#8696a0] cursor-pointer" />
                <span className="text-sm text-[#e9edef] cursor-pointer">
                  Share invite link
                </span>
              </button>

              <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left">
                <Heart size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Add to favorites</span>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 border-t border-[#2a3942] space-y-2">
              <button
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left"
                onClick={handleLeaveGroup}
              >
                <LogOut size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Exit group</span>
              </button>

              <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left">
                <AlertTriangle size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Report group</span>
              </button>

              {isGroupAdmin && (
                <button
                  className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left text-red-400"
                  onClick={handleDeleteGroup}
                >
                  <Trash2 size={20} className="text-red-400" />
                  <span className="text-sm">Delete group</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <InviteModal
        showInviteModal={showInviteModal}
        setShowInviteModal={setShowInviteModal}
        chat={chat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredResults={filteredResults}
        selectedUsers={selectedUsers}
        handleUserSelect={handleUserSelect}
        handleAddSelectedUsers={handleAddSelectedUsers}
        handleShareInvite={handleShareInvite}
      />
    </AnimatePresence>
  );
};

export default GroupInfoPopup;
