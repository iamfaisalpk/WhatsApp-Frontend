import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical, Search, Brush, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import instance from "../../Services/axiosInstance";
import { setSelectedChat } from "../../store/slices/chatSlice";
import { fetchChats } from "../../../../utils/chatThunks";

const GroupHeader = ({
  onBack,
  onSearch,
  onClearLocalMessages,
  onGroupInfo,
}) => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state) => state.chat);
  const [showOptions, setShowOptions] = useState(false);

  const menuRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClearChat = async () => {
    try {
      if (!selectedChat?._id) return;
      await instance.delete(`/api/messages/clear/${selectedChat._id}`);
      dispatch(fetchChats());
      if (onClearLocalMessages) onClearLocalMessages();
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      if (!selectedChat?._id) return;
      await instance.put(`/api/chat/group-leave`, { chatId: selectedChat._id });
      dispatch(setSelectedChat(null));
      dispatch(fetchChats());
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#161717] text-white relative cursor-pointer">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="lg:hidden block">
          <ArrowLeft className="w-5 h-5 text-[#8696a0]" />
        </button>

        {/* Group Avatar */}
        <div
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 cursor-pointer"
          onClick={onGroupInfo}
        >
          {selectedChat?.groupAvatar ? (
            <img
              src={selectedChat.groupAvatar}
              alt="Group"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm bg-[#2a3942] text-gray-300">
              {selectedChat?.groupName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="leading-4">
          <div className="font-medium text-sm">{selectedChat?.groupName}</div>
          <div className="text-xs text-[#8696a0]">
            {
              [
                ...new Map(
                  (selectedChat?.members || [])
                    .filter((m) => m && m._id) // ✅ Skip undefined/null members
                    .map((m) => [m._id, m])
                ).values(),
              ].length
            }{" "}
            participants
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 relative">
        <Search
          className="w-5 h-5 text-[#8696a0] cursor-pointer"
          onClick={onSearch}
        />

        <MoreVertical
          className="w-5 h-5 text-[#8696a0] cursor-pointer"
          onClick={() => setShowOptions((prev) => !prev)}
        />

        {showOptions && (
          <div
            ref={menuRef}
            className="absolute right-0 top-10 w-40 bg-[#233138] rounded-md shadow-lg z-20"
          >
            <button
              onClick={handleClearChat}
              className="flex items-center px-4 py-2 text-sm w-full text-white hover:bg-[#2a3942]"
            >
              <Brush className="w-4 h-4 mr-2" /> Clear Chat
            </button>

            <button
              onClick={handleLeaveGroup}
              className="flex items-center px-4 py-2 text-sm w-full text-red-400 hover:bg-[#2a3942]"
            >
              <LogOut className="w-4 h-4 mr-2" /> Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupHeader;
