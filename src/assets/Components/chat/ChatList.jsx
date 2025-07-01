import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchChats,
  setSelectedChat,
  toggleFavorite,
  markAsRead,
} from "../../store/slices/chatSlice";
import { Star, StarOff } from "lucide-react";

const ChatList = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { chats, selectedChat, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleChatSelect = (chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(markAsRead(chat._id));
    navigate(`/app/chats/${chat._id}`);
  };

  const handleToggleFavorite = async (e, chatId) => {
    e.stopPropagation();
    await dispatch(toggleFavorite(chatId));
    dispatch(fetchChats());
  };

  // ✅ Combine chats + selectedChat (if not already included)
  const allChats = [...chats];
  if (
    selectedChat &&
    !chats.some((c) => c._id === selectedChat._id)
  ) {
    allChats.unshift(selectedChat);
  }

  // ✅ Filtered by tab
  const filteredChats = allChats
    .filter((chat) => {
      if (activeTab === "Unread") return chat.isRead === false;
      if (activeTab === "Favorites") return chat.isFavorite === true;
      if (activeTab === "Groups") return chat.isGroup === true;
      return true;
    })
    // ✅ Sort by latest message time
    .sort((a, b) => {
      const aTime = new Date(a.lastMessage?.timestamp || 0);
      const bTime = new Date(b.lastMessage?.timestamp || 0);
      return bTime - aTime;
    });

  return (
    <div className="overflow-y-auto h-full">
      {loading && (
        <p className="p-4 text-sm text-gray-400">Loading chats...</p>
      )}
      {!loading && filteredChats.length === 0 && (
        <p className="p-4 text-sm text-gray-400">
          No chats found in {activeTab}.
        </p>
      )}

      {filteredChats.map((chat) => {
        const otherUser = chat.isGroup
          ? null
          : chat.members.find((m) => m._id !== user._id);

        const displayName = chat.isGroup
          ? chat.groupName
          : otherUser?.name || "Unknown";
        const profileImage = chat.isGroup
          ? chat.groupAvatar
          : otherUser?.profilePic;

        return (
          <div
            key={chat._id}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-[#2c3e50] ${
              selectedChat?._id === chat._id ? "bg-[#2c3e50]" : ""
            }`}
            onClick={() => handleChatSelect(chat)}
          >
            <img
              src={profileImage || "/default-avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold text-white">{displayName}</p>
              <p className="text-sm text-gray-400 truncate max-w-[180px]">
                {chat.isGroup && chat.lastMessage?.sender?._id !== user._id
                  ? `${chat.lastMessage?.sender?.name?.split(" ")[0]}: `
                  : ""}
                {chat.lastMessage?.text || "No messages yet"}
              </p>
            </div>

            <div className="ml-auto text-right flex flex-col items-end justify-between gap-1">
              <span className="text-xs text-gray-400">
                {chat.lastMessage?.timestamp
                  ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>

              {!chat.isRead && (
                <span
                  className="w-2 h-2 bg-[#25D366] rounded-full pointer-events-none"
                  title="Unread"
                ></span>
              )}

              <button
                onClick={(e) => handleToggleFavorite(e, chat._id)}
                className="text-yellow-400"
                title={chat.isFavorite ? "Remove from Favorites" : "Mark as Favorite"}
              >
                {chat.isFavorite ? <Star size={16} /> : <StarOff size={16} />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
