import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchChats, setSelectedChat } from '../../store/slices/chatSlice';

const ChatList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { chats, selectedChat, loading } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);

useEffect(() => {
    dispatch(fetchChats());
}, [dispatch]);

const handleChatSelect = (chat) => {
    dispatch(setSelectedChat(chat));
    navigate(`/app/chats/${chat._id}`);
};

return (
    <div className="overflow-y-auto h-full">
        {loading && <p className="p-4 text-sm text-gray-400">Loading chats...</p>}

        {chats?.length === 0 && !loading && (
        <p className="p-4 text-sm text-gray-400">No chats found. Start a new conversation!</p>
    )}

    {chats?.map((chat) => {
        const otherUser = chat.isGroup
            ? null
            : chat.members.find((m) => m._id !== user._id);

        const displayName = chat.isGroup ? chat.groupName : otherUser?.name || "Unknown";
        const profileImage = chat.isGroup
            ? chat.groupAvatar
            : otherUser?.profilePic;

        return (
        <div
            key={chat._id}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-700 ${
                selectedChat?._id === chat._id ? 'bg-gray-700' : ''
            }`}
            onClick={() => handleChatSelect(chat)}
        >
            <img
                src={profileImage || '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
                <p className="font-semibold text-white">{displayName}</p>
                <p className="text-sm text-gray-400 truncate max-w-[180px]">
                    {chat.isGroup && chat.lastMessage?.sender?._id !== user._id
                        ? `${chat.lastMessage?.sender?.name?.split(" ")[0]}: `
                            : ""}
                    {chat.lastMessage?.text || "No messages yet"}
                </p>

            </div>
        </div>
        );
    })}
    </div>
);
};

export default ChatList;
