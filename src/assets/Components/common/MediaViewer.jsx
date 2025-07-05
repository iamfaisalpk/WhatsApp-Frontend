import React, { useState } from "react";
import {
  MoreVertical,
  Check,
  CheckCheck,
  CornerUpLeft,
  CornerUpRight,
  Smile,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { useDispatch } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import { setMediaToView } from "../../store/slices/chatSlice";
import useChatLogic from "../../../hooks/useChatLogic";

const MessageBubble = ({
  msg,
  user,
  otherUser,
  replyToMessage,
  setReplyToMessage,
  isSelectionMode,
  setIsSelectionMode,
  selectedMessages,
  setSelectedMessages,
  onForward,
}) => {
  const dispatch = useDispatch();
  const { deleteMessage } = useChatLogic()
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);

  const isOwnMessage = msg.sender._id === user._id;
  const isSelected = selectedMessages.some((m) => m._id === msg._id);

  const toggleSelect = () => {
    if (!isSelectionMode) setIsSelectionMode(true);
    if (isSelected) {
      setSelectedMessages((prev) => prev.filter((m) => m._id !== msg._id));
    } else {
      setSelectedMessages((prev) => [...prev, msg]);
    }
  };

  const handleReply = () => {
    setReplyToMessage(msg);
    setShowMenu(false);
  };

  const handleForward = () => {
    onForward?.(msg);
    setShowMenu(false);
  };

  const handleReaction = (emojiData) => {
    const emoji = emojiData.emoji;
    console.log("Reacted with", emoji);
    setShowEmojiPicker(false);
  };

  const handleDelete = (deleteForEveryone) => {
    dispatch(deleteMessage({ messageId: msg._id, deleteForEveryone }));
    setShowDeleteOptions(false);
    setShowMenu(false);
  };

  const getReplySnippet = (reply) => {
    if (!reply) return "";
    if (reply.text) return reply.text;
    if (reply.media?.type === "image") return "📷 Photo";
    if (reply.media?.type === "video") return "🎥 Video";
    if (reply.voiceNote) return "🎤 Voice Note";
    return "📌 File";
  };

  return (
    <div
      className={clsx(
        "group relative px-2 flex",
        isOwnMessage ? "justify-end" : "justify-start"
      )}
      onClick={isSelectionMode ? toggleSelect : undefined}
      onContextMenu={(e) => {
        e.preventDefault();
        toggleSelect();
      }}
    >
      <div
        className={clsx(
          "rounded-xl px-3 py-2 max-w-[75%] relative",
          msg.deletedForEveryone
            ? "bg-[#3a3a3a] text-gray-400 italic"
            : isOwnMessage
            ? "bg-[#075E54] text-white"
            : "bg-[#2a2a2a] text-white",
          isSelected && "ring-2 ring-green-500"
        )}
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => {
          setShowMenu(false);
          setShowDeleteOptions(false);
        }}
      >
        {/* Menu Actions */}
        {showMenu && !isSelectionMode && !msg.deletedForEveryone && (
          <div className="absolute top-1 right-1 z-40">
            <button
              className="text-gray-300 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical size={16} />
            </button>

            <div className="absolute right-0 mt-1 bg-[#1e1e1e] border border-gray-700 rounded shadow-md z-50">
              <button
                className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-[#333] text-white w-full text-left"
                onClick={handleReply}
              >
                <CornerUpLeft size={14} /> Reply
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-[#333] text-white w-full text-left"
                onClick={handleForward}
              >
                <CornerUpRight size={14} /> Forward
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-[#333] text-white w-full text-left"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              >
                <Smile size={14} /> React
              </button>
              {isOwnMessage && !showDeleteOptions && (
                <button
                  className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-[#333] text-red-400 w-full text-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteOptions(true);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              {showDeleteOptions && (
                <div className="bg-[#2a2a2a] rounded p-1 space-y-1">
                  <button
                    className="block w-full text-left text-sm px-3 py-1 hover:bg-[#333] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(false); // For me
                    }}
                  >
                    Delete for me only
                  </button>
                  <button
                    className="block w-full text-left text-sm px-3 py-1 hover:bg-[#b33333] text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(true); // For everyone
                    }}
                  >
                    Delete for everyone
                  </button>
                  <button
                    className="block w-full text-left text-sm px-3 py-1 hover:bg-[#555] text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteOptions(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute z-50 bottom-10 right-0">
            <EmojiPicker onEmojiClick={handleReaction} />
          </div>
        )}

        {/* Forwarded Message */}
        {msg.forwardFrom && !msg.deletedForEveryone && (
          <div className="text-sm text-gray-400 mb-1 italic">
            📩 Forwarded from: {msg.forwardFrom.name || "Unknown"}
          </div>
        )}

        {/* Replied Message - FIXED DESIGN */}
        {msg.replyTo && !msg.deletedForEveryone && (
          <div 
            className={clsx(
              "border-l-4 border-green-500 pl-2  text-sm rounded p-2 mb-2",
              // Different styling based on message sender
              isOwnMessage 
                ? "bg-[#0a403a] text-gray-200" 
                : "bg-[#1a1a1a] text-gray-300"  
            )}
          >
            <div 
              className={clsx(
                "font-medium truncate text-xs mb-1",
                isOwnMessage 
                  ? "text-green-300" // Light green for own message replies
                  : "text-green-400"  // Brighter green for other user replies
              )}
            >
              {msg.replyTo?.sender?._id === user._id
                ? "You"
                : msg.replyTo?.sender?.name || "Unknown"}
            </div>
            <div 
              className={clsx(
                "truncate italic text-xs",
                isOwnMessage 
                  ? "text-gray-300" 
                  : "text-gray-400"
              )}
            >
              {getReplySnippet(msg.replyTo)}
            </div>
          </div>
        )}

        {/* Message Content */}
        {msg.deletedForEveryone ? (
          <div className="italic text-sm text-gray-400">
            🗑️ This message was deleted
          </div>
        ) : (
          <>
            {msg.text && <div className="whitespace-pre-wrap">{msg.text}</div>}

            {msg.media?.url && (
              <div className="mt-2 cursor-pointer">
                {msg.media.type === "image" ? (
                  <img
                    src={msg.media.url}
                    alt="media"
                    className="max-h-52 rounded"
                    onClick={() =>
                      dispatch(setMediaToView({ url: msg.media.url, type: "image" }))
                    }
                  />
                ) : msg.media.type === "video" ? (
                  <video
                    className="max-h-52 rounded"
                    controls
                    onClick={() =>
                      dispatch(setMediaToView({ url: msg.media.url, type: "video" }))
                    }
                  >
                    <source src={msg.media.url} type="video/mp4" />
                  </video>
                ) : (
                  <a
                    href={msg.media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline"
                  >
                    📌 File
                  </a>
                )}
              </div>
            )}

            {msg.voiceNote?.url && (
              <div className="mt-2">
                <audio controls src={msg.voiceNote.url}></audio>
              </div>
            )}
          </>
        )}

        {/* Seen Check */}
        {isOwnMessage && !msg.deletedForEveryone && (
          <div className="absolute bottom-1 right-2 text-xs text-white flex items-center space-x-1">
            {msg.seenBy?.length > 1 ? (
              <CheckCheck size={14} className="text-blue-400" />
            ) : (
              <Check size={14} className="text-gray-300" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;