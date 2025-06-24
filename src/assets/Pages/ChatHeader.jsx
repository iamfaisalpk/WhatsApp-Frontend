import React from "react";
import { useSelector } from "react-redux";

const ChatHeader = () => {
    const { selectedChat } = useSelector((state) => state.chat);
    const currentUser = JSON.parse(localStorage.getItem("user"));

if (!selectedChat) return null;

    const isGroup = selectedChat.isGroup;
    const otherUser = isGroup
    ? null
    : selectedChat.members.find((u) => u._id !== currentUser._id);

return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
        <img
        src={
            isGroup
                ? selectedChat.groupAvatar || "/group.png"
                : otherUser?.profilePic || "/avatar.png"
            }
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
        />
        <div>
            <h2 className="text-lg font-semibold">
            {isGroup ? selectedChat.groupName : otherUser?.name}
            </h2>
            <p className="text-sm text-gray-400">
            {isGroup ? `${selectedChat.members.length} members` : "Online"}
        </p>
        </div>
        </div>
    </div>
);
};

export default ChatHeader;
