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
} from "lucide-react";
import instance from "../../Services/axiosInstance";
import { setSelectedChat, fetchChats } from "../../store/slices/chatSlice";
import ChatSearch from "./ChatSearch";

const ChatHeader = ({ onBack, onSearch, onClearLocalMessages }) => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((s) => s.chat);
  const { user: currentUser } = useSelector((s) => s.auth);

  const [showOptions, setShowOptions] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const otherUser = selectedChat?.members?.find(
    (user) => user._id !== currentUser?._id
  );

  const handleDeleteChat = async () => {
    if (!selectedChat?._id) return;
    try {
      await instance.delete(`/api/chats/${selectedChat._id}`);
      dispatch(setSelectedChat(null));
      dispatch(fetchChats());
      setShowOptions(false);
    } catch (error) {
      console.error("Delete chat failed:", error);
    }
  };

  const handleClearChat = async () => {
    if (!selectedChat?._id) return;
    try {
      await instance.delete(`/api/messages/clear/${selectedChat._id}`);
      if (onClearLocalMessages) onClearLocalMessages(); // ✅ clear from ChatBox state
      dispatch(fetchChats());
      setShowOptions(false);
    } catch (error) {
      console.error("Clear chat failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-between bg-[#202c33] text-white px-4 py-2 border-b border-[#2a3942] relative">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="lg:hidden block">
          <ArrowLeft className="w-5 h-5 text-[#8696a0]" />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
          {otherUser?.profilePic ? (
            <img
              src={otherUser.profilePic}
              alt={otherUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm bg-[#2a3942] text-gray-300">
              {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="leading-4">
          <div className="font-medium text-sm">
            {otherUser?.name || "Unknown"}
          </div>
          <div className="text-xs text-[#8696a0]">online</div>
        </div>
      </div>

      <div className="flex items-center space-x-4 relative">
        <Video className="w-5 h-5 cursor-pointer text-[#8696a0]" />
        <Phone className="w-5 h-5 cursor-pointer text-[#8696a0]" />
        <div className="relative" ref={menuRef}>
          <MoreVertical
            className="w-5 h-5 cursor-pointer text-[#8696a0]"
            onClick={() => setShowOptions((prev) => !prev)}
          />

          {showOptions && (
            <div className="absolute right-0 mt-1 w-40 bg-[#233138] rounded-md shadow-lg z-20">
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
      </div>
    </div>
  );
};

export default ChatHeader;
