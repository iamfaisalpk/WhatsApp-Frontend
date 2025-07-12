import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchChats,
  setSelectedChat,
  toggleFavorite,
  markAsRead,
  toggleMuteChat,
  toggleArchiveChat,
  deleteChat,
} from "../../store/slices/chatSlice";
import {
  Star,
  StarOff,
  MoreVertical,
  Archive,
  Trash2,
  VolumeX,
  Volume2,
  Check,
  CheckCheck,
  Pin,
  Users,
} from "lucide-react";

const ChatList = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { chats, selectedChat, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChatSelect = (chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(markAsRead(chat._id));
    navigate(`/app/chats/${chat._id}`);

    if (!chats.some((c) => c._id === chat._id)) {
      dispatch(fetchChats());
    }
  };

  const handleToggleFavorite = async (e, chatId) => {
    e.stopPropagation();
    try {
      await dispatch(toggleFavorite(chatId));
      dispatch(fetchChats());
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleArchiveChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      await dispatch(toggleArchiveChat(chatId));
    } catch (error) {
      console.error("Error archiving chat:", error);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      await dispatch(deleteChat(chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleMuteChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      await dispatch(toggleMuteChat(chatId));
    } catch (error) {
      console.error("Error muting chat:", error);
    }
  };

  // Format timestamp WhatsApp style
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = now - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      // Yesterday
      return "Yesterday";
    } else if (diffDays < 7) {
      // This week - show day name
      return messageDate.toLocaleDateString([], { weekday: "long" });
    } else {
      // Older - show date
      return messageDate.toLocaleDateString([], {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  };

  // Get message preview WhatsApp style
  const getMessagePreview = (chat) => {
    if (!chat.lastMessage) return "No messages yet";

    const { lastMessage } = chat;

    // Handle different message types
    if (lastMessage.media) {
      if (lastMessage.media.type?.startsWith("image/")) return "📷 Photo";
      if (lastMessage.media.type?.startsWith("video/")) return "🎥 Video";
      if (lastMessage.media.type?.startsWith("audio/")) return "🎵 Audio";
      return "📎 Document";
    }

    if (lastMessage.voiceNote) return "🎤 Voice message";
    if (lastMessage.location) return "📍 Location";
    if (lastMessage.contact) return "👤 Contact";

    return lastMessage.text || "Message";
  };

  // Get message status icon
  const getMessageStatus = (chat) => {
    if (!chat.lastMessage || chat.lastMessage.sender?._id !== user._id)
      return null;

    const { lastMessage } = chat;

    if (lastMessage.status === "sent") {
      return <Check className="w-4 h-4 text-gray-400" />;
    } else if (lastMessage.status === "delivered") {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else if (lastMessage.status === "read") {
      return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
    }

    return null;
  };

  // Merge selected chat (if not in list) to ensure it's visible
  const allChats = [...chats];
  if (selectedChat && !chats.some((c) => c._id === selectedChat._id)) {
    allChats.unshift(selectedChat);
  }

  // Filter by active tab
  const filteredChats = allChats
    .filter((chat) => {
      if (activeTab === "Unread") return !chat.isRead;
      if (activeTab === "Favorites") return chat.isFavorite;
      if (activeTab === "Groups") return chat.isGroup;
      if (activeTab === "Archived") return chat.isArchived;
      return !chat.isArchived; // Don't show archived chats in main list
    })
    .sort((a, b) => {
      // Pinned chats first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then by timestamp
      const aTime = new Date(a.lastMessage?.timestamp || 0);
      const bTime = new Date(b.lastMessage?.timestamp || 0);
      return bTime - aTime;
    });

  return (
    <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00a884] mx-auto"></div>
          <p className="text-sm text-gray-400 mt-2">Loading chats...</p>
        </div>
      )}

      {!loading && filteredChats.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">
            {activeTab === "Unread" && "No unread chats"}
            {activeTab === "Favorites" && "No favorite chats"}
            {activeTab === "Groups" && "No group chats"}
            {activeTab === "Archived" && "No archived chats"}
            {!["Unread", "Favorites", "Groups", "Archived"].includes(
              activeTab
            ) && "No chats yet"}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Start a new conversation to see chats here
          </p>
        </div>
      )}

      {filteredChats.map((chat) => {
        const otherUser =
          chat.isGroup || !Array.isArray(chat.members)
            ? null
            : chat.members.find((m) => String(m._id) !== String(user._id)) ||
              {};

        const isBlocked = otherUser?.isBlocked || otherUser?.isBlockedByMe;
        const isOnline = otherUser?.isOnline && !isBlocked;

        // Hide blocked chats completely
        if (!chat.isGroup && isBlocked) return null;

        // Display name logic
        const displayName = chat.isGroup
          ? chat.groupName || chat.name || "Unnamed Group"
          : isBlocked
          ? "Blocked User"
          : otherUser?.savedName ||
            otherUser?.name ||
            otherUser?.phone ||
            "Unknown User";

        const profileImage = chat.isGroup
          ? chat.groupAvatar?.trim()
            ? chat.groupAvatar
            : "/WhatsApp.jpg"
          : isBlocked
          ? "/WhatsApp.jpg"
          : otherUser?.profilePic?.trim()
          ? otherUser.profilePic
          : "/WhatsApp.jpg";

        // Optional clean log for debugging (if needed)
        console.log("Group Avatar:", chat?.groupAvatar);

        // Unread count
        const unreadCount = chat.unreadCount || 0;

        return (
          <div
            key={chat._id}
            className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#2a3942] transition-colors duration-150 border-b border-[#2a3942]/30 group ${
              selectedChat?._id === chat._id ? "bg-[#2a3942]" : ""
            }`}
            onClick={() => handleChatSelect(chat)}
          >
            {/* Profile Image Container */}
            <div className="relative flex-shrink-0">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = "/WhatsApp.jpg";
                }}
              />

              {/* Online indicator for individual chats */}
              {!chat.isGroup && isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
              )}

              {/* Group indicator */}
              {chat.isGroup && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00a884] rounded-full border-2 border-[#111b21] flex items-center justify-center">
                  <Users className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            {/* Chat Content */}
            <div className="flex-1 min-w-0">
              {/* Name and Status Row */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-[#e9edef] truncate text-[15px]">
                  {displayName}
                </h3>

                {/* Pinned indicator */}
                {chat.isPinned && (
                  <Pin className="w-3 h-3 text-[#8696a0] flex-shrink-0" />
                )}

                {/* Favorite indicator */}
                {chat.isFavorite && (
                  <Star className="w-3 h-3 text-[#ffb700] fill-current flex-shrink-0" />
                )}

                {/* Muted indicator */}
                {chat.muted && (
                  <VolumeX className="w-3 h-3 text-[#8696a0] flex-shrink-0" />
                )}
              </div>

              {/* Last Message Row */}
              <div className="flex items-center gap-1">
                {/* Message status for sent messages */}
                {getMessageStatus(chat)}

                {/* Message preview */}
                <p className="text-[#8696a0] text-sm truncate flex-1">
                  {chat.isGroup &&
                  chat.lastMessage?.sender?._id !== user._id &&
                  chat.lastMessage?.sender?.name
                    ? `${chat.lastMessage.sender.name.split(" ")[0]}: `
                    : chat.isGroup && chat.lastMessage?.sender?._id === user._id
                    ? "You: "
                    : ""}
                  {getMessagePreview(chat)}
                </p>
              </div>
            </div>

            {/* Right Side Info */}
            <div className="flex flex-col items-end gap-1 text-right ml-2">
              {/* Timestamp */}
              <span className="text-xs text-[#8696a0] whitespace-nowrap">
                {formatTimestamp(chat.lastMessage?.timestamp)}
              </span>

              {/* Unread count and actions */}
              <div className="flex items-center gap-1">
                {/* Unread count */}
                {unreadCount > 0 && (
                  <span className="bg-[#00a884] text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {/* More options - Always visible */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    className="p-1 text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown((prev) =>
                        prev === chat._id ? null : chat._id
                      );
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown menu */}
                  {activeDropdown === chat._id && (
                    <div className="absolute top-full right-0 mt-1 bg-[#233138] text-[#e9edef] rounded-md shadow-lg border border-[#2a3942] w-48 z-50 py-2 animate-in fade-in-0 zoom-in-95 duration-100">
                      <button
                        className="w-full px-4 py-2 text-sm text-left hover:bg-[#2a3942] flex items-center gap-3 transition-colors"
                        onClick={(e) => {
                          handleToggleFavorite(e, chat._id);
                          setActiveDropdown(null);
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            chat.isFavorite
                              ? "text-[#ffb700] fill-current"
                              : "text-[#8696a0]"
                          }`}
                        />
                        <span>
                          {chat.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"}
                        </span>
                      </button>

                      <button
                        className="w-full px-4 py-2 text-sm text-left hover:bg-[#2a3942] flex items-center gap-3 transition-colors"
                        onClick={(e) => handleMuteChat(e, chat._id)}
                      >
                        {chat.muted ? (
                          <Volume2 className="w-4 h-4 text-[#8696a0]" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-[#8696a0]" />
                        )}
                        <span>
                          {chat.muted ? "Unmute" : "Mute notifications"}
                        </span>
                      </button>

                      <button
                        className="w-full px-4 py-2 text-sm text-left hover:bg-[#2a3942] flex items-center gap-3 transition-colors"
                        onClick={(e) => handleArchiveChat(e, chat._id)}
                      >
                        <Archive className="w-4 h-4 text-[#8696a0]" />
                        <span>Archive chat</span>
                      </button>

                      <div className="border-t border-[#2a3942] my-1"></div>

                      <button
                        className="w-full px-4 py-2 text-sm text-left hover:bg-[#2a3942] text-[#ea6962] hover:text-[#ea6962] flex items-center gap-3 transition-colors"
                        onClick={(e) => handleDeleteChat(e, chat._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
