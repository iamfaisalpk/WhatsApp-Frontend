// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { updateChatInList, setSelectedChat } from "../../store/slices/chatSlice";
// import {
//   Star,
//   MoreVertical,
//   Archive,
//   Trash2,
//   VolumeX,
//   Volume2,
//   Check,
//   CheckCheck,
//   Pin,
//   Users,
// } from "lucide-react";
// import {
//   deleteChat,
//   markAsRead,
//   toggleArchiveChat,
//   toggleFavorite,
//   toggleMuteChat,
// } from "../../../../utils/chatThunks";

// const ChatList = ({ activeTab }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { chats, archivedChats, selectedChat } = useSelector((state) => state.chat);
//   const { user } = useSelector((state) => state.auth);
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setActiveDropdown(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleChatSelect = async (chat) => {
//     dispatch(setSelectedChat(chat));
//     if (chat.unreadCount > 0 || !chat.isRead) {
//       await dispatch(markAsRead(chat._id));
//     }
//     navigate(`/app/chats/${chat._id}`);
//   };

//   const handleDropdownToggle = (e, chatId) => {
//     e.stopPropagation();
//     setActiveDropdown(activeDropdown === chatId ? null : chatId);
//   };

//   const formatTimestamp = (ts) => {
//     if (!ts) return "";
//     const date = new Date(ts);
//     const now = new Date();
//     const diff = (now - date) / (1000 * 60 * 60 * 24);
//     if (diff < 1) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//     if (diff < 2) return "Yesterday";
//     if (diff < 7) return date.toLocaleDateString([], { weekday: "long" });
//     return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
//   };

//   const getMessagePreview = (chat) => {
//     if (!chat.lastMessage) return "No messages yet";
//     const m = chat.lastMessage;
//     if (m.media) return m.media.type.startsWith("image/") ? "Photo" : m.media.type.startsWith("video/") ? "Video" : m.media.type.startsWith("audio/") ? "Audio" : "Document";
//     if (m.voiceNote) return "Voice message";
//     return m.text || "Message";
//   };

//   const getMessageStatus = (chat) => {
//     if (!chat.lastMessage || chat.lastMessage.sender?._id !== user._id) return null;
//     const s = chat.lastMessage.status;
//     if (s === "sent") return <Check className="w-4 h-4 text-gray-400" />;
//     if (s === "delivered") return <CheckCheck className="w-4 h-4 text-gray-400" />;
//     if (s === "read") return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
//     return null;
//   };

//   const allChats = activeTab === "Archived" ? archivedChats : chats;
//   const filteredChats = allChats
//     .filter((chat) => {
//       if (!chat?._id) return false;
//       if (activeTab === "Unread") return chat.unreadCount > 0;
//       if (activeTab === "Favorites") return chat.isFavorite;
//       if (activeTab === "Groups") return chat.isGroup;
//       return true;
//     })
//     .sort((a, b) => new Date(b.lastMessageTime || b.lastMessage?.timestamp || 0) - new Date(a.lastMessageTime || a.lastMessage?.timestamp || 0));

//   if (filteredChats.length === 0) {
//     return <div className="p-8 text-center text-gray-400 text-sm">No chats</div>;
//   }

//   return (
//     <div className="overflow-y-auto h-full">
//       {filteredChats.map((chat) => {
//         const otherUser = !chat.isGroup && chat.members?.find(m => String(m._id) !== String(user._id));
//         const isBlocked = otherUser?.isBlocked || otherUser?.isBlockedByMe;
//         const chatId = String(chat._id);
//         const isOpen = activeDropdown === chatId;

//         if (!chat.isGroup && isBlocked && !isOpen) return null;

//         const name = chat.isGroup ? chat.groupName || "Group" : isBlocked ? "Blocked" : otherUser?.name || "User";
//         const pic = chat.isGroup ? chat.groupAvatar || "/WhatsApp.jpg" : isBlocked ? "/WhatsApp.jpg" : otherUser?.profilePic || "/WhatsApp.jpg";
//         const unread = chat.unreadCount || 0;

//         return (
//           <div
//             key={chat._id}
//             className={`flex gap-3 px-4 py-3 hover:bg-[#2a3942] border-b border-[#2a3942]/30 cursor-pointer ${selectedChat?._id === chat._id ? "bg-[#2a3942]" : ""}`}
//             onClick={() => handleChatSelect(chat)}
//           >
//             <div className="relative">
//               <img src={pic} alt="" className="w-12 h-12 rounded-full" onError={e => e.target.src = "/WhatsApp.jpg"} />
//               {chat.isGroup && <Users className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] text-white rounded-full p-1 border-2 border-[#111b21]" />}
//             </div>

//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <h3 className="text-[#e9edef] font-medium truncate">{name}</h3>
//                 {chat.isPinned && <Pin className="w-4 h-4 text-[#8696a0]" />}
//                 {chat.isFavorite && <Star className="w-4 h-4 text-[#ffb700] fill-current" />}
//                 {chat.muted && <VolumeX className="w-4 h-4 text-[#8696a0]" />}
//               </div>
//               <div className="flex items-center gap-1 text-sm text-[#8696a0]">
//                 {getMessageStatus(chat)}
//                 <span className="truncate">
//                   {chat.isGroup && chat.lastMessage?.sender?._id !== user._id ? `${chat.lastMessage.sender.name.split(" ")[0]}: ` : ""}
//                   {getMessagePreview(chat)}
//                 </span>
//               </div>
//             </div>

//             <div className="text-right">
//               <div className="text-xs text-[#8696a0]">{formatTimestamp(chat.lastMessageTime || chat.lastMessage?.timestamp)}</div>
//               <div className="flex items-center gap-2 mt-1">
//                 {unread > 0 && (
//                   <span className="bg-[#00a884] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
//                     {unread > 99 ? "99+" : unread}
//                   </span>
//                 )}

//                 <div className="relative">
//                   <button
//                     onClick={(e) => handleDropdownToggle(e, chatId)}
//                     className="p-1 hover:bg-[#2a3942] rounded cursor-pointer"
//                   >
//                     <MoreVertical size={18} />
//                   </button>

//                   {isOpen && (
//                     <div ref={dropdownRef} className="absolute right-0 mt-1 w-48 bg-[#233138] rounded-md shadow-lg border border-[#2a3942] z-50 py-2">
//                       {/* FAVORITE */}
//                       <button
//                         className="w-full px-4 py-2 cursor-pointer text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
//                         onClick={async (e) => {
//                           e.stopPropagation();
//                           await dispatch(toggleFavorite(chat._id)).unwrap();
//                           setActiveDropdown(null);
//                         }}
//                       >
//                         <Star className={`w-4 h-4 ${chat.isFavorite ? "text-[#ffb700] fill-current" : "text-[#8696a0]"}`} />
//                         {chat.isFavorite ? "Remove from favorites" : "Add to favorites"}
//                       </button>

//                       {/* MUTE */}
//                       <button
//                         className="w-full cursor-pointer px-4 py-2 text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
//                         onClick={async (e) => {
//                           e.stopPropagation();
//                           await dispatch(toggleMuteChat(chat._id)).unwrap();
//                           dispatch(updateChatInList({ _id: chat._id, muted: !chat.muted }));
//                           setActiveDropdown(null);
//                         }}
//                       >
//                         {chat.muted ? <Volume2 className="w-4 h-4 text-[#8696a0]" /> : <VolumeX className="w-4 h-4 text-[#8696a0]" />}
//                         {chat.muted ? "Unmute" : "Mute notifications"}
//                       </button>

//                       {/* ARCHIVE */}
//                       <button
//                         className="w-full px-4 cursor-pointer py-2 text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
//                         onClick={async (e) => {
//                           e.stopPropagation();
//                           const newArchived = !chat.isArchived;
//                           await dispatch(toggleArchiveChat(chat._id)).unwrap();
//                           dispatch(updateChatInList({ _id: chat._id, isArchived: newArchived }));
//                           setActiveDropdown(null);
//                         }}
//                       >
//                         <Archive className="w-4 h-4 text-[#8696a0]" />
//                         {chat.isArchived ? "Unarchive chat" : "Archive chat"}
//                       </button>

//                       <div className="border-t border-[#2a3942] my-1" />

//                       {/* DELETE */}
//                       <button
//                         className="w-full cursor-pointer px-4 py-2 text-left hover:bg-[#2a3942] text-[#ea6962] flex items-center gap-3 text-sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (window.confirm("Delete this chat?")) {
//                             dispatch(deleteChat(chat._id));
//                             setActiveDropdown(null);
//                           }
//                         }}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                         Delete chat
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ChatList;




import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateChatInList, setSelectedChat } from "../../store/slices/chatSlice";
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
import {
  deleteChat,
  markAsRead,
  toggleArchiveChat,
  toggleFavorite,
  toggleMuteChat,
} from "../../../../utils/chatThunks";

const ChatList = ({ activeTab }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { chats, archivedChats, selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChatSelect = async (chat) => {
    dispatch(setSelectedChat(chat));
    if (chat.unreadCount > 0 || !chat.isRead) {
      await dispatch(markAsRead(chat._id));
    }
    navigate(`/app/chats/${chat._id}`);
  };

  const handleDropdownToggle = (e, chatId) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    const now = new Date();
    const diff = (now - date) / (1000 * 60 * 60 * 24);
    if (diff < 1) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 2) return "Yesterday";
    if (diff < 7) return date.toLocaleDateString([], { weekday: "long" });
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
  };

  const getMessagePreview = (chat) => {
    if (!chat.lastMessage) return "No messages yet";
    const m = chat.lastMessage;
    if (m.media) {
      if (m.media.type?.startsWith("image/")) return "Photo";
      if (m.media.type?.startsWith("video/")) return "Video";
      if (m.media.type?.startsWith("audio/")) return "Audio";
      return "Document";
    }
    if (m.voiceNote) return "Voice message";
    return m.text || "Message";
  };

  const getMessageStatus = (chat) => {
    if (!chat.lastMessage || chat.lastMessage.sender?._id !== user._id) return null;
    const s = chat.lastMessage.status;
    if (s === "sent") return <Check className="w-4 h-4 text-gray-400" />;
    if (s === "delivered") return <CheckCheck className="w-4 h-4 text-gray-400" />;
    if (s === "read") return <CheckCheck className="w-4 h-4 text-[#53bdeb]" />;
    return null;
  };

  const allChats = activeTab === "Archived" ? archivedChats : chats;

  const filteredChats = allChats
    .filter((chat) => {
      if (!chat?._id) return false;
      if (activeTab === "Unread") return chat.unreadCount > 0;
      if (activeTab === "Favorites") return chat.isFavorite;
      if (activeTab === "Groups") return chat.isGroup;
      return true;
    })
    .sort((a, b) => {
      const aTime = a.lastMessageTime || a.lastMessage?.timestamp || 0;
      const bTime = b.lastMessageTime || b.lastMessage?.timestamp || 0;
      return new Date(bTime) - new Date(aTime);
    });

  if (filteredChats.length === 0) {
    return <div className="p-8 text-center text-gray-400 text-sm">No chats found</div>;
  }

  return (
    <div className="overflow-y-auto h-full">
      {filteredChats.map((chat) => {
        const otherUser = !chat.isGroup && Array.isArray(chat.members)
          ? chat.members.find((m) => m?._id && String(m._id) !== String(user._id))
          : null;

        const isBlocked = otherUser?.isBlocked || otherUser?.isBlockedByMe;
        const chatId = String(chat._id);
        const isOpen = activeDropdown === chatId;

        if (!chat.isGroup && isBlocked && !isOpen) return null;

        const displayName = chat.isGroup
          ? chat.groupName || "Unnamed Group"
          : isBlocked
          ? "Blocked User"
          : otherUser?.savedName || otherUser?.name || otherUser?.phone || "Unknown";

        const profilePic = chat.isGroup
          ? chat.groupAvatar || chat.groupPic || "/WhatsApp.jpg"
          : isBlocked
          ? "/WhatsApp.jpg"
          : otherUser?.profilePic || "/WhatsApp.jpg";

        const unreadCount = Math.max(0, chat.unreadCount || 0);

        return (
          <div
            key={chat._id}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors border-b border-[#2a3942]/30 cursor-pointer ${
              selectedChat?._id === chat._id ? "bg-[#2a3942]" : ""
            }`}
            onClick={() => handleChatSelect(chat)}
          >
            {/* Profile Picture */}
            <div className="relative flex-shrink-0">
              <img
                src={profilePic}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => (e.target.src = "/WhatsApp.jpg")}
              />
              {!chat.isGroup && otherUser?.isOnline && !isBlocked && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#111b21]" />
              )}
              {chat.isGroup && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00a884] rounded-full border-2 border-[#111b21] flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[#e9edef] font-medium truncate text-base">{displayName}</h3>
                {chat.isPinned && <Pin className="w-4 h-4 text-[#8696a0]" />}
                {chat.isFavorite && <Star className="w-4 h-4 text-[#ffb700] fill-current" />}
                {chat.muted && <VolumeX className="w-4 h-4 text-[#8696a0]" />}
              </div>
              <div className="flex items-center gap-1 text-sm text-[#8696a0]">
                {getMessageStatus(chat)}
                <p className="truncate">
                  {chat.isGroup && chat.lastMessage?.sender?._id !== user._id && chat.lastMessage?.sender?.name
                    ? `${chat.lastMessage.sender.name.split(" ")[0]}: `
                    : chat.isGroup && chat.lastMessage?.sender?._id === user._id
                    ? "You: "
                    : ""}
                  {getMessagePreview(chat)}
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col items-end">
              <span className="text-xs text-[#8696a0]">
                {formatTimestamp(chat.lastMessageTime || chat.lastMessage?.timestamp)}
              </span>

              <div className="flex items-center gap-2 mt-2">
                {unreadCount > 0 && (
                  <span className="bg-[#00a884] text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}

                {/* Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ← Critical: Prevent row click
                      handleDropdownToggle(e, chatId);
                    }}
                    className="p-2 hover:bg-[#2a3942] rounded-full transition"
                  >
                    <MoreVertical size={18} className="text-[#8696a0]" />
                  </button>

                  {isOpen && (
                    <div
                      ref={dropdownRef}
                      onClick={(e) => e.stopPropagation()} // ← Prevent all clicks inside menu from closing/navigating
                      className="absolute right-0 top-full mt-1 w-56 bg-[#233138] rounded-lg shadow-xl border border-[#2a3942] z-50 py-1"
                    >
                      {/* FAVORITE */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await dispatch(toggleFavorite(chat._id)).unwrap();
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
                      >
                        <Star className={`w-4 h-4 ${chat.isFavorite ? "text-[#ffb700] fill-current" : "text-[#8696a0]"}`} />
                        {chat.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      </button>

                      {/* MUTE */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await dispatch(toggleMuteChat(chat._id)).unwrap();
                          dispatch(updateChatInList({ _id: chat._id, muted: !chat.muted }));
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
                      >
                        {chat.muted ? <Volume2 className="w-4 h-4 text-[#8696a0]" /> : <VolumeX className="w-4 h-4 text-[#8696a0]" />}
                        {chat.muted ? "Unmute notifications" : "Mute notifications"}
                      </button>

                      {/* ARCHIVE */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const willArchive = !chat.isArchived;
                          await dispatch(toggleArchiveChat(chat._id)).unwrap();
                          dispatch(updateChatInList({ _id: chat._id, isArchived: willArchive }));
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#2a3942] flex items-center gap-3 text-sm"
                      >
                        <Archive className="w-4 h-4 text-[#8696a0]" />
                        {chat.isArchived ? "Unarchive chat" : "Archive chat"}
                      </button>

                      <div className="border-t border-[#2a3942] my-1" />

                      {/* DELETE */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this chat? This action cannot be undone.")) {
                            dispatch(deleteChat(chat._id));
                            setActiveDropdown(null);
                          }
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#2a3942] text-[#ea6962] flex items-center gap-3 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete chat
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