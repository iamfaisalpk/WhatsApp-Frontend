import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../../../../utils/socket";
import { sendMessage } from "../../store/slices/messageSlice";


const MessageInput = () => {
    const dispatch = useDispatch();
    const { selectedChat } = useSelector((state) => state.chat);
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const typingTimeout = useRef(null);

const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    dispatch(
    sendMessage({
        conversationId: selectedChat._id,
        text,
        media,
    })
    );

    socket.emit("stop-typing", {
        conversationId: selectedChat._id,
        userId: user._id,
    });

    setText("");
    setMedia(null);
};

const handleTyping = () => {
    socket.emit("typing", {
        conversationId: selectedChat._id,
        userId: user._id,
    });

    if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
        socket.emit("stop-typing", {
        conversationId: selectedChat._id,
        userId: user._id,
    });
    }, 2000);
};

return (
    <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-t border-gray-700"
    >
    <input
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={(e) => setMedia(e.target.files[0])}
        className="hidden"
        id="media-upload"
    />
    <label
        htmlFor="media-upload"
        className="cursor-pointer text-xl text-white"
    >
        📎
    </label>

    <input
        type="text"
        placeholder="Type a message"
        className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none"
        value={text}
        onChange={(e) => {
            setText(e.target.value);
            handleTyping();
        }}
    />
    <button
        type="submit"
        className="px-4 py-2 bg-green-500 rounded-md text-white hover:bg-green-600"
    >
        Send
    </button>
    </form>
);
};

export default MessageInput;
