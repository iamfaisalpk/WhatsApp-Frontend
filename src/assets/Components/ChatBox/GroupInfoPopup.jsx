import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
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
import socket from "../../../../utils/socket";

// Constants
const MEMBER_DISPLAY_LIMIT = 5;
const DESCRIPTION_MAX_LENGTH = 512;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SEARCH_DEBOUNCE_DELAY = 500;

// Custom hooks
const useSocketEvents = (selectedChat, user, onMemberLeft) => {
  useEffect(() => {
    const handleUserLeftGroup = ({ chatId: leftChatId, userId: leftUserId }) => {
      if (selectedChat?._id !== leftChatId) return;
      
      onMemberLeft(leftUserId);
      
      if (leftUserId !== user?._id) {
        toast.info("A group member has left the group.");
      }
    };

    socket.on("left-group", handleUserLeftGroup);
    return () => socket.off("left-group", handleUserLeftGroup);
  }, [selectedChat?._id, user?._id, onMemberLeft]);
};

const useBodyOverflow = (condition) => {
  useEffect(() => {
    document.body.style.overflow = condition ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [condition]);
};

const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const { data } = await axios.get(`/api/users?search=${searchQuery}`);
          setSearchResults(data);
          setFilteredResults(data);
        } catch (err) {
          console.error("Search error:", err);
          setSearchResults([]);
          setFilteredResults([]);
        }
      } else {
        setSearchResults([]);
        setFilteredResults([]);
      }
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return { searchQuery, setSearchQuery, searchResults, filteredResults };
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return `${date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })} at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  } catch (err) {
    console.error("Date formatting error:", err);
    return "";
  }
};

const validateImageFile = (file) => {
  if (!file.type.startsWith("image/")) {
    return { isValid: false, error: "Please select a valid image file" };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size must be less than 5MB" };
  }
  
  return { isValid: true };
};

// Memoized components
const GroupAvatar = memo(({ 
  chat, 
  isGroupAdmin, 
  onAvatarUpload, 
  isLoading 
}) => (
  <div className="relative mb-4">
    <img
      src={chat.groupAvatar || "/default-avatar.png"}
      alt={chat.groupName}
      className="w-32 h-32 rounded-full object-cover border-2 border-[#2a3942]"
      loading="lazy"
    />
    {isGroupAdmin && (
      <>
        <input
          type="file"
          accept="image/*"
          id="group-avatar-upload"
          style={{ display: "none" }}
          onChange={onAvatarUpload}
          disabled={isLoading}
        />
        <button
          className="absolute bottom-2 right-2 bg-[#00a884] rounded-full p-2 cursor-pointer hover:bg-[#00967a] disabled:opacity-50"
          onClick={() => document.getElementById("group-avatar-upload").click()}
          disabled={isLoading}
          type="button"
        >
          <Camera size={16} className="text-white" />
        </button>
      </>
    )}
  </div>
));

const MemberItem = memo(({ 
  member, 
  currentUser, 
  groupAdmin, 
  isGroupAdmin, 
  onRemoveUser 
}) => (
  <div className="flex items-center justify-between py-2 px-2 hover:bg-[#2a3942] cursor-pointer rounded group">
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <div className="relative">
        <img
          src={member.profilePic || "/default-avatar.png"}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover"
          loading="lazy"
        />
        {member.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-[#e9edef] truncate">
            {member._id === currentUser._id ? "You" : member.name}
          </p>
          {member._id === groupAdmin?._id && (
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

    {isGroupAdmin && member._id !== groupAdmin?._id && (
      <button
        onClick={() => onRemoveUser(member._id)}
        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-[#2a3942] text-xs"
        type="button"
      >
        Remove
      </button>
    )}
  </div>
));

const GroupInfoPopup = ({
  chat,
  onClose,
  onUpdate,
  show = true,
  showInviteModal,
  setShowInviteModal,
}) => {
  const { user: currentUser } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  // State management
  const [activeTab, setActiveTab] = useState("members");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState(chat?.groupDescription || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Custom hooks
  const { searchQuery, setSearchQuery, filteredResults } = useUserSearch();
  
  useBodyOverflow(showInviteModal);

  // Memoized values
  const isGroupAdmin = useMemo(() => 
    chat?.groupAdmin?._id === currentUser._id, 
    [chat?.groupAdmin?._id, currentUser._id]
  );

  const displayedMembers = useMemo(() => 
    Array.from(
      new Map(
        (chat?.members || [])
          .filter(m => m && m._id)
          .map(m => [m._id, m])
      ).values()
    ), 
    [chat?.members]
  );

  const memberCount = displayedMembers.length;
  const visibleMembers = showMoreOptions 
    ? displayedMembers 
    : displayedMembers.slice(0, MEMBER_DISPLAY_LIMIT);

  const handleMemberLeft = useCallback((leftUserId) => {
    if (onUpdate) onUpdate();
  }, [onUpdate]);

  const handleUserSelect = useCallback((userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleAddSelectedUsers = useCallback(async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-add", {
        chatId: chat._id,
        userId: selectedUsers,
      });

      toast.success("Users added to group");

      // Send invites
      for (const userId of selectedUsers) {
        try {
          await axios.post("/api/chat", { userId });
        } catch (err) {
          console.warn(`Failed to send invite to user ${userId}:`, err);
        }
      }

      dispatch(fetchChats());
      onUpdate?.();
      setShowInviteModal(false);
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Add/send invite error:", err);
      toast.error(err.response?.data?.message || "Failed to add users");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUsers, chat._id, dispatch, onUpdate, setShowInviteModal, setSearchQuery]);

  const handleRename = useCallback(async () => {
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
      onUpdate?.();
    } catch (err) {
      console.error("Rename error:", err);
      toast.error(err.response?.data?.message || "Rename failed");
    } finally {
      setIsLoading(false);
    }
  }, [chat._id, chat.groupName, dispatch, onUpdate]);

  const handleDescriptionSave = useCallback(async () => {
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
      onUpdate?.();
    } catch (err) {
      console.error("Description update error:", err);
      toast.error(err.response?.data?.message || "Failed to update description");
    } finally {
      setIsLoading(false);
    }
  }, [tempDescription, chat.groupDescription, chat._id, dispatch, onUpdate]);

  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("groupAvatar", file);

    try {
      await axios.put(`/api/chat/group-avatar/${chat._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Avatar updated!");
      dispatch(fetchChats());
      onUpdate?.();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }, [chat._id, dispatch, onUpdate]);

  const handleRemoveUser = useCallback(async (userId) => {
    if (!window.confirm("Remove this user from the group?")) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-remove", {
        chatId: chat._id,
        userId,
      });
      toast.success("User removed");
      dispatch(fetchChats());
      onUpdate?.();
    } catch (err) {
      console.error("Remove user error:", err);
      toast.error(err.response?.data?.message || "Failed to remove user");
    } finally {
      setIsLoading(false);
    }
  }, [chat._id, dispatch, onUpdate]);

  const handleLeaveGroup = useCallback(async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    setIsLoading(true);
    try {
      await axios.put("/api/chat/group-leave", { chatId: chat._id });
      toast.success("You left the group");
      dispatch(fetchChats());
      onClose();
    } catch (err) {
      console.error("Leave group error:", err);
      toast.error(err.response?.data?.message || "Leave group failed");
    } finally {
      setIsLoading(false);
    }
  }, [chat._id, dispatch, onClose]);

  const handleDeleteGroup = useCallback(async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    setIsLoading(true);
    try {
      await axios.delete(`/api/chat/${chat._id}`);
      toast.success("Group deleted");
      dispatch(fetchChats());
      onClose();
    } catch (err) {
      console.error("Delete group error:", err);
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setIsLoading(false);
    }
  }, [chat._id, dispatch, onClose]);

  const handleShareInvite = useCallback(async () => {
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
  }, [chat.inviteToken, setShowInviteModal]);

  // Socket events
  useSocketEvents(chat, currentUser, handleMemberLeft);

  // Early returns
  if (!chat || !show) return null;

  const getAdminName = () => {
    if (!chat?.members || !chat?.groupAdmin?._id) return "Admin";
    const admin = chat.members.find(m => m && m._id === chat.groupAdmin._id);
    return admin ? admin.name : "Admin";
  };

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

  const actionButtons = [
    { icon: MessageSquare, label: "Media", color: "bg-[#00a884]" },
    { icon: Phone, label: "Audio", color: "bg-[#00a884]" },
    { icon: Video, label: "Video", color: "bg-[#00a884]" },
    { icon: Search, label: "Search", color: "bg-[#00a884]" },
  ];

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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          <div className="flex justify-between items-center p-4 border-b border-[#2a3942]">
            <h2 className="text-lg font-medium">Group info</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X size={20}  className="cursor-pointer"/>
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-72px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Group Avatar and Name */}
            <div className="flex flex-col items-center text-center p-6 pb-4">
              <GroupAvatar
                chat={chat}
                isGroupAdmin={isGroupAdmin}
                onAvatarUpload={handleAvatarUpload}
                isLoading={isLoading}
              />
              
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">{chat.groupName}</h3>
                {isGroupAdmin && (
                  <button
                    onClick={handleRename}
                    className="text-[#8696a0] hover:text-white transition-colors"
                    type="button"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-[#8696a0] mb-2">
                Group • {memberCount} members
              </p>
              
              <p className="text-sm text-[#8696a0]">
                Created by {isGroupAdmin ? "You" : getAdminName()}
                {chat.createdAt && <span> on {formatDate(chat.createdAt)}</span>}
              </p>
            </div>

            {/* Group Description Section */}
            <div className="px-4 py-3 border-b border-[#2a3942]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#8696a0]">Description</p>
                {isGroupAdmin && (
                  <button
                    onClick={() => {
                      setTempDescription(chat.groupDescription || "");
                      setIsEditingDescription(true);
                    }}
                    className="text-[#8696a0] hover:text-white transition-colors"
                    type="button"
                  >
                    <Edit3 size={14} className="cursor-pointer" />
                  </button>
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
                    maxLength={DESCRIPTION_MAX_LENGTH}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#8696a0]">
                      {tempDescription.length}/{DESCRIPTION_MAX_LENGTH}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setTempDescription(chat.groupDescription || "");
                          setIsEditingDescription(false);
                        }}
                        className="px-3 py-1 text-sm text-[#8696a0] hover:text-white transition-colors cursor-pointer"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDescriptionSave}
                        className="px-3 py-1 text-sm bg-[#00a884] text-white rounded hover:bg-[#00967a] transition-colors cursor-pointer"
                        type="button"
                      >
                        Save
                      </button>
                    </div>
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
                {actionButtons.map((item, i) => (
                  <button
                    key={i}
                    className="flex flex-col items-center space-y-2 hover:bg-[#2a3942] p-3 rounded transition-colors"
                    type="button"
                  >
                    <div className={`${item.color} rounded-full p-3`}>
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-[#e9edef]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Options */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#2a3942] cursor-pointer transition-colors"
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
                      <span className="text-sm text-[#8696a0]">{item.count}</span>
                    )}
                    {item.status && (
                      <span className="text-sm text-[#8696a0]">{item.status}</span>
                    )}
                    {item.toggle && (
                      <button
                        className="w-10 h-6 bg-[#2a3942] rounded-full relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00a884]"
                        onClick={() => setMuteNotifications(prev => !prev)}
                        type="button"
                      >
                        <div
                          className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                            muteNotifications
                              ? "left-5 bg-[#00a884]"
                              : "left-1 bg-[#8696a0]"
                          }`}
                        />
                      </button>
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
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="text-[#8696a0] hover:text-white transition-colors"
                      title="Add member"
                      type="button"
                    >
                      <Users size={16} />
                    </button>
                  )}
                  <Search size={16} className="text-[#8696a0]" />
                </div>
              </div>

              <div className="space-y-1">
                {visibleMembers.map(member =>
                  member ? (
                    <MemberItem
                      key={member._id}
                      member={member}
                      currentUser={currentUser}
                      groupAdmin={chat.groupAdmin}
                      isGroupAdmin={isGroupAdmin}
                      onRemoveUser={handleRemoveUser}
                    />
                  ) : null
                )}
              </div>

              {/* Show more/less toggle */}
              {memberCount > MEMBER_DISPLAY_LIMIT && (
                <button
                  className="flex items-center justify-center py-2 w-full hover:bg-[#2a3942] rounded transition-colors"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  type="button"
                >
                  <ChevronDown
                    size={16}
                    className={`text-[#8696a0] transition-transform ${
                      showMoreOptions ? "rotate-180" : ""
                    }`}
                  />
                  <span className="text-sm text-[#8696a0] ml-2">
                    {showMoreOptions ? "Show less" : `${memberCount - MEMBER_DISPLAY_LIMIT} more`}
                  </span>
                </button>
              )}
            </div>

            {/* Additional Options */}
            <div className="px-4 py-2 border-t border-[#2a3942]">
              <button
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors"
                onClick={() => setShowInviteModal(true)}
                type="button"
              >
                <Share2 size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Share invite link</span>
              </button>

              <button 
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors"
                type="button"
              >
                <Heart size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Add to favorites</span>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 border-t border-[#2a3942] space-y-2">
              <button
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors"
                onClick={handleLeaveGroup}
                type="button"
              >
                <LogOut size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Exit group</span>
              </button>

              <button 
                className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors"
                type="button"
              >
                <AlertTriangle size={20} className="text-red-400" />
                <span className="text-sm">Report group</span>
              </button>

              {isGroupAdmin && (
                <button
                  className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left text-red-400 transition-colors"
                  onClick={handleDeleteGroup}
                  type="button"
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

export default memo(GroupInfoPopup);