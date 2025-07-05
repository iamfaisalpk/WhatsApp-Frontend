import React, { useState, useEffect } from "react";
import instance from "../../Services/axiosInstance";
import { useSelector } from "react-redux";
import MediaViewer from "../common/MediaViewer";
import { Loader2, SendHorizonal } from "lucide-react";

const ForwardMessageModal = ({ isOpen, onClose, messageToForward }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) fetchChats();
  }, [isOpen]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await instance.get("/api/chats");
      setChats(data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (chatId) => {
    try {
      setSendingTo(chatId);
      const payload = {
        conversationId: chatId,
        text: messageToForward.text || "",
        media: messageToForward.media || null,
        voiceNote: messageToForward.voiceNote || null,
        replyTo: null,
        forwardedFrom: {
          name: messageToForward?.sender?.name || "Unknown",
          _id: messageToForward?.sender?._id || "",
        },
      };

      await instance.post("/api/messages", payload);
      onClose();
    } catch (err) {
      console.error("Forwarding error:", err);
    } finally {
      setSendingTo(null);
    }
  };

  if (!isOpen) return null;

  return (
    <MediaViewer onClose={onClose}>
      <div className="p-4 text-white w-[350px] sm:w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Forward to...</h2>

        {loading ? (
          <div className="text-gray-400 flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            Loading chats...
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {chats.length === 0 && (
              <p className="text-gray-400">No chats found.</p>
            )}
            {chats
              .filter((chat) => chat.members.some((m) => m._id !== user._id))
              .map((chat) => {
                const otherUser = chat.members.find((m) => m._id !== user._id);
                if (!otherUser) return null;

                return (
                  <div
                    key={chat._id}
                    onClick={() => handleForward(chat._id)}
                    className={`bg-[#1f1f1f] p-3 rounded hover:bg-[#2a2a2a] cursor-pointer flex justify-between items-center ${
                      sendingTo === chat._id
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={otherUser?.profilePic || "/user.png"}
                        alt={otherUser?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span>{otherUser?.name || "Unknown"}</span>
                    </div>

                    {sendingTo === chat._id ? (
                      <Loader2 size={18} className="animate-spin text-green-400" />
                    ) : (
                      <SendHorizonal size={18} className="text-green-500" />
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <button
          className="mt-5 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </MediaViewer>
  );
};

export default ForwardMessageModal;
