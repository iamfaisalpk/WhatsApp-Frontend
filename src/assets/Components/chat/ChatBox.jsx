import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ScrollToBottom from "react-scroll-to-bottom";
import { setSelectedChat } from "../../store/slices/chatSlice";
import socket from "../../../../utils/socket";
import instance from "../../Services/axiosInstance";
import { v4 as uuidv4 } from "uuid";

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

  const otherUser = selectedChat?.members?.find((u) => u._id !== user._id) || {};

  useEffect(() => {
    if (!selectedChat) return;

    instance.get(`/api/messages/${selectedChat._id}`)
      .then((res) => {
        const messagesWithKeys = res.data.map((msg) => ({
          ...msg,
          _clientKey: msg._id || uuidv4(),
        }));
        setMessages(messagesWithKeys);
      })
      .catch(() => setMessages([]));

    socket.emit("join-chat", selectedChat._id);
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = (msg) => {
      if (msg.conversationId === selectedChat?._id && msg.sender?._id !== user._id) {
        setMessages((prev) => [...prev, { ...msg, _clientKey: msg._id || uuidv4() }]);
      }
    };

    socket.on("message-received", handleNewMessage);
    return () => socket.off("message-received", handleNewMessage);
  }, [selectedChat, user._id]);

  useEffect(() => {
    socket.on("typing", (id) => id !== user._id && setTypingUserId(id));
    socket.on("stop-typing", () => setTypingUserId(null));
    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [user._id]);

  useEffect(() => {
    const handleDeletedMessage = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? {
            ...m,
            text: null,
            media: null,
            voiceNote: null,
            deletedForEveryone: true,
          } : m
        )
      );
    };

    socket.on("message-deleted", handleDeletedMessage);
    return () => socket.off("message-deleted", handleDeletedMessage);
  }, []);

  const handleTyping = () => {
    socket.emit("typing", { conversationId: selectedChat._id, userId: user._id });
    setTimeout(() => {
      socket.emit("stop-typing", { conversationId: selectedChat._id, userId: user._id });
    }, 1500);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !mediaFile) return;

    const tempId = uuidv4();
    const optimisticMessage = {
      _clientKey: tempId,
      text: newMessage.trim(),
      media: mediaFile ? { type: "uploading", url: "" } : null,
      voiceNote: null,
      senderId: user._id,
      createdAt: new Date().toISOString(),
      seenBy: [user._id],
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setMediaFile(null);

    const formData = new FormData();
    formData.append("conversationId", selectedChat._id);
    if (mediaFile) formData.append("media", mediaFile);
    if (newMessage.trim()) formData.append("text", newMessage.trim());

    try {
      const res = await instance.post("/api/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) =>
        prev.map((m) =>
          m._clientKey === tempId
            ? { ...res.data.message, _clientKey: res.data.message._id || uuidv4() }
            : m
        )
      );
    } catch (err) {
      console.error("Send error:", err?.response?.data || err.message);
    }
  };

  const handleVoiceSend = async (voiceBlob, duration) => {
    const formData = new FormData();
    formData.append("conversationId", selectedChat._id);
    formData.append("voiceNote", voiceBlob, "voiceNote.webm");
    formData.append("duration", duration);

    try {
      const res = await instance.post("/api/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [
        ...prev,
        { ...res.data.message, _clientKey: res.data.message._id || uuidv4() },
      ]);
    } catch (err) {
      console.error("Voice note send error:", err?.response?.data || err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await instance.delete(`/api/messages/delete-message/${messageId}`);
      console.log("Deleting message with ID:", messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: null, media: null, voiceNote: null, deletedForEveryone: true }
            : m
        )
      );
    } catch (error) {
      console.error(" Delete message error:", error.message);
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
        <span key={i} className="bg-yellow-400 text-black font-bold rounded px-1">{part}</span>
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
            Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] h-full relative">
      <div className="absolute inset-0 opacity-5 z-0" style={{ backgroundImage: `url("public/WhatsApp.svg.png")`, backgroundRepeat: "repeat" }} />

      <ChatHeader
        otherUser={otherUser}
        onBack={() => dispatch(setSelectedChat(null))}
        onSearch={(text) => setSearchText(text)}
        onClearLocalMessages={() => setMessages([])}
      />

      <ScrollToBottom className="flex-1 overflow-y-auto px-4 py-4 z-10">
        <div className="space-y-1">
          {filteredMessages.map((msg, i) => {
            const isSender = (msg.sender?._id || msg.senderId) === user._id;
            const prev = filteredMessages[i - 1];
            const showTime = !prev || new Date(msg.createdAt) - new Date(prev.createdAt) > 5 * 60 * 1000;

            return (
              <div key={msg._clientKey} className="relative group">
                {showTime && (
                  <div className="flex justify-center my-4">
                    <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}

                <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-lg text-sm shadow relative transition max-w-xs sm:max-w-md ${
                    isSender ? "bg-[#005c4b]" : "bg-[#202c33]"
                  } text-white`}>
                    {msg.deletedForEveryone ? (
                      <span className="italic text-gray-400"> This message was deleted</span>
                    ) : (
                      <>
                        {msg.media?.url && (
                          <img src={msg.media.url} alt="media" className="rounded mb-1" />
                        )}
                        {msg.voiceNote?.url && (
                          <audio controls src={msg.voiceNote.url} className="mb-1" />
                        )}
                        {msg.text && <div>{highlightText(msg.text)}</div>}
                      </>
                    )}

                    <div className="text-[10px] text-right mt-1 text-gray-300">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isSender && <span className="ml-1">{msg.seenBy?.length > 1 ? "✔✔" : "✔"}</span>}
                    </div>
                  </div>
                </div>

                {isSender && !msg.deletedForEveryone && (
                  <button
                    className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition"
                    onClick={() => handleDeleteMessage(msg._id)}
                    title="Delete message"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}

          {typingUserId && (
            <div className="flex justify-start mb-4">
              <div className="bg-[#202c33] px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollToBottom>

      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        mediaFile={mediaFile}
        setMediaFile={setMediaFile}
        onSend={handleSend}
        onTyping={handleTyping}
        onVoiceSend={handleVoiceSend}
      />
    </div>
  );
};

export default ChatBox;
