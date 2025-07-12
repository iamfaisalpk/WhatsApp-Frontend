import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Video,
  Phone,
  Search,
  MoreVertical,
  Trash2,
  Brush,
  UserX,
  UserMinus,
} from "lucide-react";
import instance from "../../Services/axiosInstance";
import { setSelectedChat, fetchChats } from "../../store/slices/chatSlice";
import ChatSearch from "../chat/ChatSearch";
import socket from "../../../../utils/socket";
import { toggleUserInfo } from "../../store/slices/uiSlice";
import GroupInfoPopup from "./GroupInfoPopup";

const ChatHeader = ({ onBack, onSearch, onClearLocalMessages }) => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((s) => s.chat);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [showOptions, setShowOptions] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  const [iBlockedThem, setIBlockedThem] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const menuRef = useRef();
  const isGroup = selectedChat?.isGroup;

  const otherUser = !isGroup
    ? selectedChat?.members?.find((u) => u._id !== currentUser?._id)
    : null;

  const chatTitle = isGroup
    ? selectedChat?.groupName
    : otherUser?.name || "Unknown";

  const chatAvatar = isGroup
    ? selectedChat?.groupAvatar?.trim()
      ? selectedChat.groupAvatar
      : "/WhatsApp.jpg"
    : otherUser?.profilePic?.trim()
    ? otherUser.profilePic
    : "/WhatsApp.jpg";


  const showPrivacy = !isGroup && (isBlockedByThem || iBlockedThem);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isGroup && otherUser?._id) {
      const fetchProfileStatus = async () => {
        try {
          const res = await instance.get(`/api/users/${otherUser._id}`);
          setIsBlockedByThem(false);
          setIBlockedThem(res.data.blockedUsers?.includes(otherUser._id));
          setIsOnline(res.data.isOnline);
          setLastSeen(res.data.lastSeen);
        } catch (err) {
          if (err.response?.status === 403) setIsBlockedByThem(true);
        }
      };
      fetchProfileStatus();
    }
  }, [otherUser, isGroup]);

  useEffect(() => {
    if (!isGroup && otherUser?._id) {
      const typingHandler = (userId) => {
        if (userId === otherUser._id) setIsTyping(true);
      };
      const stopTypingHandler = (userId) => {
        if (userId === otherUser._id) setIsTyping(false);
      };

      socket.on("user-typing", typingHandler);
      socket.on("stop-typing", stopTypingHandler);

      return () => {
        socket.off("user-typing", typingHandler);
        socket.off("stop-typing", stopTypingHandler);
      };
    }
  }, [otherUser, isGroup]);

  useEffect(() => {
    if (!isGroup && otherUser?._id) {
      const updateOnline = (userId) => {
        if (userId === otherUser._id) setIsOnline(true);
      };
      const updateOffline = ({ userId, lastSeen }) => {
        if (userId === otherUser._id) {
          setIsOnline(false);
          setLastSeen(lastSeen);
        }
      };

      socket.on("user-online", updateOnline);
      socket.on("user-offline", updateOffline);

      return () => {
        socket.off("user-online", updateOnline);
        socket.off("user-offline", updateOffline);
      };
    }
  }, [otherUser, isGroup]);

  const handleDeleteChat = async () => {
    try {
      await instance.delete(`/api/chat/${selectedChat._id}`);
      dispatch(setSelectedChat(null));
      dispatch(fetchChats());
      setShowOptions(false);
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleClearChat = async () => {
    try {
      await instance.delete(`/api/messages/clear/${selectedChat._id}`);
      if (onClearLocalMessages) onClearLocalMessages();
      dispatch(fetchChats());
      setShowOptions(false);
    } catch (err) {
      console.error("Clear error", err);
    }
  };

  const handleBlockUser = async () => {
    try {
      await instance.put(`/api/users/block/${otherUser._id}`);
      setIBlockedThem(true);
      setShowOptions(false);
    } catch (err) {
      console.error("Block failed", err);
    }
  };

  const handleUnblockUser = async () => {
    try {
      await instance.put(`/api/users/unblock/${otherUser._id}`);
      setIBlockedThem(false);
      setShowOptions(false);
    } catch (err) {
      console.error("Unblock failed", err);
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return isToday
      ? `last seen today at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : `last seen on ${date.toLocaleDateString()} at ${date.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )}`;
  };

  return (
    <div className="flex items-center justify-between bg-[#161717] text-white px-4 py-2 relative">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => {
          if (isGroup) {
            setShowGroupInfo(true);
          } else {
            dispatch(toggleUserInfo());
          }
        }}
      >
        <button onClick={onBack} className="lg:hidden block">
          <ArrowLeft className="w-5 h-5 text-[#8696a0]" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
          <img
            src={showPrivacy ? "/default-avatar.png" : chatAvatar}
            alt="Avatar"
            className={`w-full h-full object-cover ${
              showPrivacy ? "blur-sm grayscale" : ""
            }`}
          />
        </div>

        <div className="leading-4">
          <div className="font-medium text-sm">
            {showPrivacy ? "Private" : chatTitle}
          </div>
          <div className="text-xs text-[#8696a0]">
            {isGroup
              ? `${selectedChat?.members?.length || 0} members`
              : iBlockedThem
              ? "You blocked this user"
              : isBlockedByThem
              ? "You are blocked"
              : isTyping
              ? "typing..."
              : isOnline
              ? "online"
              : formatLastSeen(lastSeen)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <Video className="w-5 h-5 text-[#8696a0]" />
        <Phone className="w-5 h-5 text-[#8696a0]" />

        <div className="relative" ref={menuRef}>
          <MoreVertical
            className="w-5 h-5 cursor-pointer text-[#8696a0]"
            onClick={() => setShowOptions((prev) => !prev)}
          />

          {showOptions && (
            <div className="absolute right-0 mt-1 w-44 bg-[#233138] rounded-md shadow-lg z-20">
              <button
                onClick={() => {
                  setShowSearchBox(true);
                  setShowOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#2a3942]"
              >
                <Search className="w-4 h-4 mr-2" /> Search
              </button>

              <button
                onClick={handleClearChat}
                className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-[#2a3942]"
              >
                <Brush className="w-4 h-4 mr-2" /> Clear Chat
              </button>

              <button
                onClick={handleDeleteChat}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-[#2a3942]"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Chat
              </button>

              {!isGroup &&
                (iBlockedThem ? (
                  <button
                    onClick={handleUnblockUser}
                    className="flex items-center w-full px-4 py-2 text-sm text-yellow-400 hover:bg-[#2a3942]"
                  >
                    <UserMinus className="w-4 h-4 mr-2" /> Unblock User
                  </button>
                ) : (
                  <button
                    onClick={handleBlockUser}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-[#2a3942]"
                  >
                    <UserX className="w-4 h-4 mr-2" /> Block User
                  </button>
                ))}
            </div>
          )}
        </div>

        {showSearchBox && (
          <ChatSearch
            onSearch={(text) => {
              onSearch(text);
              setShowSearchBox(false);
            }}
            onClose={() => setShowSearchBox(false)}
          />
        )}

        {isGroup && selectedChat && (
          <GroupInfoPopup
            chat={selectedChat}
            show={showGroupInfo}
            onClose={() => setShowGroupInfo(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
