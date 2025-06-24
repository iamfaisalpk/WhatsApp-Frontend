import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedChat } from "../../store/slices/chatSlice";
import { ArrowLeft } from "lucide-react";
import instance from "../../Services/axiosInstance";
import socket from "../../../../utils/socket";

const ChatBox = () => {
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUserId, setTypingUserId] = useState(null);
  const scrollRef = useRef();

  const otherUser = selectedChat?.users?.find((u) => u._id !== user._id);

useEffect(() => {
const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
        const { data } = await instance.get(`/api/messages/${selectedChat._id}`);
        console.log("Fetched messages", data); 
        setMessages(Array.isArray(data) ? data : []); 
        socket.emit("join-chat", selectedChat._id);
    } catch (error) {
        console.error("Error loading messages", error);
        setMessages([]); 
    }
};

    fetchMessages();
}, [selectedChat]);



useEffect(() => {
    socket.on("typing", (typingUserId) => {
      if (typingUserId !== user._id) setTypingUserId(typingUserId);
    });

    socket.on("stop-typing", () => {
      setTypingUserId(null);
    });

    return () => {
      socket.off("typing");
      socket.off("stop-typing");
    };
  }, [user._id]);


  const handleTyping = () => {
    socket.emit("typing", {
      conversationId: selectedChat._id,
      userId: user._id,
    });

    setTimeout(() => {
      socket.emit("stop-typing", {
        conversationId: selectedChat._id,
        userId: user._id,
      });
    }, 3000);
  };

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: selectedChat._id,
      senderId: user._id,
      text: newMessage,
      media: null,
    };

    socket.emit("new-message", messageData);
    setNewMessage("");
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-white bg-[#0b141a]">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a]">
      {/* Mobile Back Button */}
      <div className="sm:hidden flex items-center gap-3 p-3 bg-[#1f2a30]">
        <button
          onClick={() => dispatch(setSelectedChat(null))}
          className="text-white hover:text-[#25D366]"
        >
          <ArrowLeft size={20} />
        </button>
        <p className="text-white font-semibold">Chat</p>
      </div>

      {/* Header with profile */}
      <div className="hidden sm:flex items-center gap-3 p-3 bg-[#1f2a30] border-b border-[#2a2f32]">
        <img
          src={otherUser?.profilePic}
          alt={otherUser?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="text-white">
          <p className="font-semibold">{otherUser?.name}</p>
          <p className="text-xs text-[#9da8af]">
            {typingUserId === otherUser?._id
              ? "typing..."
              : otherUser?.isOnline
              ? "online"
              : "last seen..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            ref={scrollRef}
            className={`flex ${
              msg.sender._id === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg text-sm max-w-sm break-words ${
                msg.sender._id === user._id
                  ? "bg-[#25D366] text-black"
                  : "bg-[#2a2f32] text-white"
              }`}
            >
              {msg.text || msg.content || "📎 Media"}
            </div>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-[#1f2a30] flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-4 py-2 rounded-full bg-[#2a2f32] text-white outline-none placeholder-[#9da8af]"
        />
        <button
          onClick={sendMessage}
          className="bg-[#25D366] text-black px-4 py-2 rounded-full font-medium hover:opacity-90 block sm:hidden"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
