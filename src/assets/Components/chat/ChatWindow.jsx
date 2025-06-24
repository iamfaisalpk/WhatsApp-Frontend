import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchMessages, markAsSeen } from "../../store/slices/messageSlice";
import { setSelectedChat } from "../../store/slices/chatSlice";
import MessageInput from "./MessageInput";
import socket from "../../../../utils/socket";

const ChatWindow = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const [typingUserId, setTypingUserId] = useState(null);
  const [seenByUsers, setSeenByUsers] = useState({});
  const { messages, loading } = useSelector((state) => state.message);
  const { chats, selectedChat } = useSelector((state) => state.chat);
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch messages and join socket room
  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
      const selected = chats.find((chat) => chat._id === chatId);
      if (selected) dispatch(setSelectedChat(selected));
      socket.emit("join-chat", chatId);
    }
  }, [chatId, dispatch, chats]);

  // Scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    socket.on("typing", (userId) => {
      if (userId !== user._id) setTypingUserId(userId);
    });

    socket.on("stop-typing", (userId) => {
      if (userId !== user._id) setTypingUserId(null);
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [user._id]);

  // Seen message emit
  useEffect(() => {
    if (chatId && messages.length) {
      dispatch(markAsSeen(chatId));
      socket.emit("message-seen", {
        conversationId: chatId,
        userId: user._id,
      });
    }
  }, [chatId, messages.length, dispatch, user._id]);

  // Seen update receive
  useEffect(() => {
    socket.on("seen-update", ({ conversationId, seenBy }) => {
      if (conversationId === chatId) {
        setSeenByUsers((prev) => ({ ...prev, [conversationId]: seenBy }));
      }
    });

    return () => socket.off("seen-update");
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Typing Indicator */}
      {typingUserId && (
        <div className="text-sm italic text-gray-400 px-4 py-2">
          Typing...
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            No messages yet
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-[75%] p-3 rounded-lg break-words ${
              msg.sender._id === user._id
                ? "bg-green-600 text-white self-end ml-auto"
                : "bg-gray-700 text-white self-start mr-auto"
            }`}
          >

          {/* Sender name (only for received messages in group chats) */}
            {msg.sender._id !== user._id && selectedChat?.isGroup && (
              <p className="text-xs text-gray-400 mb-1">{msg.sender.name}</p>
            )}

            {msg.text && <p>{msg.text}</p>}

            {msg.media && (
              <img
                  src={msg.media.startsWith("http") ? msg.media : `${import.meta.env.VITE_API_URL}/${msg.media}`}
                  alt="media"
                  className="mt-2 rounded-md max-w-[200px]"
                />
            )}

            {/* Message status */}
            {msg.sender._id === user._id && (
              <p className="text-xs text-right text-gray-300 mt-1">
              {seenByUsers[chatId]?.filter(id => id !== user._id).length > 0 ? "Seen ✅" : "Sent ✔"}
              </p>
            )}

          </div>
        ))}
      </div>

        {/* Message Input */}
        <MessageInput />
    </div>
);
};

export default ChatWindow;
