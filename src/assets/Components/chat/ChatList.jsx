import React, { useEffect, useState, useRef, useCallback } from "react";
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
  messageReceived,
  messageSent,
  updateChatInList,
} from "../../store/slices/chatSlice";
import {
  Star,
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
import socket from "../../../../utils/socket";

const ChatList = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { chats, selectedChat, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const handleMessageReceived = useCallback(
    (newMessage) => {
      console.log("Message received:", newMessage);

      const chatId = newMessage.chatId || newMessage.conversationId;

      const messageWithUserId = {
        ...newMessage,
        currentUserId: user._id,
      };

      dispatch(messageReceived(messageWithUserId));

      if (selectedChat?._id !== chatId) {
        dispatch(fetchChats());
      }
    },
    [dispatch, user._id, selectedChat?._id]
  );

  useEffect(() => {
    dispatch(fetchChats());

    // Load saved chat from localStorage
    const savedChat = JSON.parse(localStorage.getItem("selectedChat"));
    if (savedChat) {
      dispatch(setSelectedChat(savedChat));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message received", handleMessageReceived);

    socket.on("chat updated", (updatedChat) => {
      console.log("Chat updated:", updatedChat);
      dispatch(updateChatInList(updatedChat));
    });

    socket.on("message sent", (data) => {
      console.log("Message sent confirmed:", data);
      dispatch(
        messageSent({
          chatId: data.conversationId || data.chatId,
          message: data.message,
        })
      );
    });

    socket.on("chat list updated", () => {
      console.log("Chat list updated, refetching...");
      dispatch(fetchChats());
    });

    return () => {
      socket.off("message received", handleMessageReceived);
      socket.off("chat updated");
      socket.off("message sent");
      socket.off("chat list updated");
    };
  }, [handleMessageReceived, dispatch]);

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

  const handleChatSelect = async (chat) => {
    try {
      // Set selected chat first
      dispatch(setSelectedChat(chat));

      // Mark as read if it has unread messages
      if (chat.unreadCount > 0 || !chat.isRead) {
        await dispatch(markAsRead(chat._id));
      }

      // Navigate to chat
      navigate(`/app/chats/${chat._id}`);
    } catch (error) {
      console.error("Error selecting chat:", error);
    }
  };

  const handleToggleFavorite = async (e, chatId) => {
    e.stopPropagation();
    try {
      await dispatch(toggleFavorite(chatId)).unwrap();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleArchiveChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      await dispatch(toggleArchiveChat(chatId)).unwrap();
    } catch (error) {
      console.error("Error archiving chat:", error);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);

    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await dispatch(deleteChat(chatId)).unwrap();
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  const handleMuteChat = async (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(null);
    try {
      await dispatch(toggleMuteChat(chatId)).unwrap();
    } catch (error) {
      console.error("Error muting chat:", error);
    }
  };

  // Format timestamp WhatsApp style
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check if date is valid
    if (isNaN(messageDate.getTime())) return "";

    const diffTime = now - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "long" });
    } else {
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
    if (
      !chat.lastMessage ||
      !user ||
      chat.lastMessage.sender?._id !== user._id
    ) {
      return null;
    }

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

  // Filter and sort chats
  const filteredChats = chats
    .filter((chat) => {
      // Basic validation
      if (!chat || !chat._id) return false;

      // Filter by active tab
      if (activeTab === "Unread") return !chat.isRead && chat.unreadCount > 0;
      if (activeTab === "Favorites") return chat.isFavorite;
      if (activeTab === "Groups") return chat.isGroup;
      if (activeTab === "Archived") return chat.isArchived;
      return !chat.isArchived; // Default: show non-archived chats
    })
    .sort((a, b) => {
      // Pinned chats first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then by timestamp (most recent first)
      const aTime = new Date(
        a.lastMessageTime || a.lastMessage?.timestamp || 0
      );
      const bTime = new Date(
        b.lastMessageTime || b.lastMessage?.timestamp || 0
      );
      return bTime - aTime;
    });

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00a884] mx-auto"></div>
        <p className="text-sm text-gray-400 mt-2">Loading chats...</p>
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400 text-sm">
          {activeTab === "Unread" && "No unread chats"}
          {activeTab === "Favorites" && "No favorite chats"}
          {activeTab === "Groups" && "No group chats"}
          {activeTab === "Archived" && "No archived chats"}
          {!["Unread", "Favorites", "Groups", "Archived"].includes(activeTab) &&
            "No chats yet"}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Start a new conversation to see chats here
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {filteredChats.map((chat) => {
        // Safely get other user info
        const otherUser =
          chat.isGroup || !Array.isArray(chat.members)
            ? null
            : chat.members.find(
                (m) => m && m._id && String(m._id) !== String(user._id)
              );

        const isBlocked = otherUser?.isBlocked || otherUser?.isBlockedByMe;
        const isOnline = otherUser?.isOnline && !isBlocked;

        // Hide blocked chats completely
        if (!chat.isGroup && isBlocked) return null;

        // Display name logic with better fallbacks
        const displayName = chat.isGroup
          ? chat.groupName || chat.name || "Unnamed Group"
          : isBlocked
          ? "Blocked User"
          : otherUser?.savedName ||
            otherUser?.name ||
            otherUser?.phone ||
            "Unknown User";

        // Profile image with proper fallbacks
        const profileImage = chat.isGroup
          ? chat.groupAvatar?.trim() || chat.groupPic?.trim() || "/WhatsApp.jpg"
          : isBlocked
          ? "/WhatsApp.jpg"
          : otherUser?.profilePic?.trim() || "/WhatsApp.jpg";

        // Safe unread count
        const unreadCount = Math.max(0, chat.unreadCount || 0);

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
                {formatTimestamp(
                  chat.lastMessageTime || chat.lastMessage?.timestamp
                )}
              </span>

              {/* Unread count and actions */}
              <div className="flex items-center gap-1">
                {/* Unread count */}
                {unreadCount > 0 && (
                  <span className="bg-[#00a884] text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {/* More options */}
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
