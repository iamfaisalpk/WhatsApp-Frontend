import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ScrollToBottom from "react-scroll-to-bottom";
import { setSelectedChat } from "../../store/slices/chatSlice";
import socket from "../../../../utils/socket";
import instance from "../../Services/axiosInstance";

import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

const ChatBox = () => {
  const { selectedChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [typingUserId, setTypingUserId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const otherUser =
    selectedChat?.members?.find((u) => u._id !== user._id) || {};

  // Fetch messages
  useEffect(() => {
    if (!selectedChat) return;
    instance
      .get(`/api/messages/${selectedChat._id}`)
      .then((res) => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMessages([]));

    socket.emit("join-chat", selectedChat._id);
  }, [selectedChat]);

  // Real-time new message receiving
  useEffect(() => {
    const handleNew = (msg) => {
      if (msg.conversationId === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("message-received", handleNew);
    return () => socket.off("message-received", handleNew);
  }, [selectedChat]);

  // Typing indicator
  useEffect(() => {
    socket.on("typing", (id) => id !== user._id && setTypingUserId(id));
    socket.on("stop-typing", () => setTypingUserId(null));
    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [user._id]);

  const handleTyping = () => {
    socket.emit("typing", { conversationId: selectedChat._id, userId: user._id });
    setTimeout(() => {
      socket.emit("stop-typing", { conversationId: selectedChat._id, userId: user._id });
    }, 1500);
  };

const handleSend = async () => {
  if (!newMessage.trim() && !mediaFile) return;

  try {
    if (mediaFile) {
      const formData = new FormData();
      formData.append("conversationId", selectedChat._id);
      formData.append("senderId", user._id);
      formData.append("media", mediaFile);
      if (newMessage.trim()) {
        formData.append("text", newMessage.trim());
      }

      const res = await instance.post("/api/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.emit("message-received", res.data.message);


      setMediaFile(null);
      setNewMessage("");
    }

    else {
      socket.emit("new-message", {
        conversationId: selectedChat._id,
        senderId: user._id,
        text: newMessage.trim(),
        media: null,
      });

      setNewMessage("");
    }
  } catch (err) {
    console.error("Send failed", err);
  }
};


  const filteredMessages = searchText
    ? messages.filter((msg) =>
        msg.text?.toLowerCase().includes(searchText.toLowerCase())
      )
    : messages;

  const highlightText = (text = "") => {
    if (!searchText) return text;
    const parts = text.split(new RegExp(`(${searchText})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchText.toLowerCase() ? (
        <span key={i} className="bg-yellow-400 text-black font-bold rounded px-1">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0b141a]">
        <div className="text-center">
          <h2 className="text-2xl text-gray-300 mb-4">WhatsApp Web</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Send and receive messages without keeping your phone online.
            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] h-full relative">
      <div
        className="absolute inset-0 opacity-5 z-0"
        style={{
          backgroundImage: `url("public/WhatsApp.svg.png")`,
          backgroundRepeat: "repeat",
        }}
      />

      <ChatHeader
        otherUser={otherUser}
        onBack={() => dispatch(setSelectedChat(null))}
        onSearch={(text) => setSearchText(text)}
      />

      <ScrollToBottom className="flex-1 overflow-y-auto px-4 py-4 z-10">
        <div className="space-y-1">
          {filteredMessages.map((msg, i) => {
            const isSender = (msg.sender?._id || msg.senderId) === user._id;
            const prev = filteredMessages[i - 1];
            const showTime =
              !prev || new Date(msg.createdAt) - new Date(prev.createdAt) > 5 * 60 * 1000;

            return (
              <div key={msg._id || i}>
                {showTime && (
                  <div className="flex justify-center my-4">
                    <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm shadow ${
                      isSender
                        ? "bg-[#005c4b] text-white rounded-br-sm"
                        : "bg-[#202c33] text-white rounded-bl-sm"
                    } max-w-xs sm:max-w-md`}
                  >
                    {/* 📎 Show media if exists */}
                    {msg.media?.url && (
                      <>
                        {msg.media.type === "image" && (
                          <img
                            src={msg.media.url}
                            alt="media"
                            className="rounded-lg max-w-xs mb-1"
                          />
                        )}
                        {msg.media.type === "video" && (
                          <video
                            controls
                            src={msg.media.url}
                            className="rounded-lg max-w-xs mb-1"
                          />
                        )}
                        {msg.media.type === "audio" && (
                          <audio controls src={msg.media.url} className="mb-1" />
                        )}
                        {msg.media.type === "file" && (
                          <a
                            href={msg.media.url}
                            download
                            className="text-blue-400 underline mb-1 block"
                          >
                            📎 Download File
                          </a>
                        )}
                      </>
                    )}

                    {/* 💬 Message text */}
                    {msg.text && <div>{highlightText(msg.text)}</div>}

                    <div className="text-[10px] text-right mt-1 text-gray-300">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ✏️ Typing Indicator */}
          {typingUserId && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#202c33] px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollToBottom>

      {/* 🧩 Bottom Chat Input */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        mediaFile={mediaFile}
        setMediaFile={setMediaFile}
        onSend={handleSend}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatBox;
