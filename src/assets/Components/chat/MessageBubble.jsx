import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

const MessageBubble = ({ message, isOwnMessage, user, onReply, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getReplySnippet = (replyTo) => {
    if (!replyTo) return "";
    if (replyTo.text) return replyTo.text;
    if (replyTo.media) {
      if (replyTo.media.type === "image") return "📷 Photo";
      if (replyTo.media.type === "video") return "🎥 Video";
      return "📎 File";
    }
    if (replyTo.voiceNote) return "🎤 Voice Note";
    return "Replied message";
  };

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2 group relative`}>
      <div
        className={`p-2 rounded-xl max-w-[70%] text-white relative ${
          isOwnMessage ? "bg-[#075E54]" : "bg-[#2a2a2a]"
        }`}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        {/* Menu Button */}
        {showMenu && (
          <div className="absolute top-1 right-1 z-20">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-gray-200 hover:text-white"
            >
              <MoreVertical size={16} />
            </button>

            {/* Popup menu */}
            <div className="absolute right-0 mt-1 bg-[#1e1e1e] border border-gray-700 rounded shadow-md z-30">
              <button
                className="px-3 py-1 text-sm hover:bg-[#333] w-full text-left text-white"
                onClick={() => onReply(message)}
              >
                📝 Reply
              </button>
              {isOwnMessage && (
                <button
                  className="px-3 py-1 text-sm hover:bg-[#333] w-full text-left text-red-400"
                  onClick={() => onDelete(message._id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✅ Reply block */}
        {message.replyTo && (
          <div className="border-l-4 border-green-400 pl-2 mb-1 text-sm text-gray-300 bg-[#1e1e1e] p-1 rounded">
            <div className="font-medium text-gray-400 truncate">
              {message.replyTo?.sender?._id === user._id
                ? "You"
                : message.replyTo?.sender?.name || "Unknown"}
            </div>
            <div className="truncate italic">{getReplySnippet(message.replyTo)}</div>
          </div>
        )}

        {/* ✅ Message content */}
        {message.text && <div>{message.text}</div>}

        {message.media?.url && (
          <div className="mt-1">
            {message.media.type === "image" ? (
              <img src={message.media.url} alt="media" className="max-h-52 rounded" />
            ) : message.media.type === "video" ? (
              <video controls className="max-h-52 rounded">
                <source src={message.media.url} type="video/mp4" />
              </video>
            ) : (
              <a
                href={message.media.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                📎 File
              </a>
            )}
          </div>
        )}

        {message.voiceNote?.url && (
          <div className="mt-1">
            <audio controls src={message.voiceNote.url}></audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
