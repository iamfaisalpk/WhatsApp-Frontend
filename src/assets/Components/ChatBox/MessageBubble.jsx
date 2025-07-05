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
import React, { useState, useRef, useEffect, forwardRef } from "react";

const MessageBubble = forwardRef((props, ref) => {
  const {
    msg,
    user,
    otherUser,
    replyToMessage,
    setReplyToMessage,
    isOwnMessage = msg.sender._id === user._id,
    isSelectionMode,
    setIsSelectionMode,
    selectedMessages,
    setSelectedMessages,
    onForward,
    onReact,
    onDelete,
  } = props;

  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ openLeft: false });

  const dropdownRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageRef = useRef(null);

  const isSelected = selectedMessages.some(
    (m) =>
      (m._id && msg._id && m._id === msg._id) ||
      (m.tempId && msg.tempId && m.tempId === msg.tempId)
  );

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowDeleteOptions(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showMenu || showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu, showEmojiPicker]);

  // Position calculation for dropdown
  useEffect(() => {
    if (showMenu && messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const shouldOpenLeft = rect.right > viewportWidth * 0.7;

      setDropdownPosition({ openLeft: shouldOpenLeft });
    }
  }, [showMenu]);

  const toggleSelect = () => {
    if (!isSelectionMode) setIsSelectionMode(true);
    if (isSelected) {
      setSelectedMessages((prev) =>
        prev.filter(
          (m) =>
            m._id &&
            msg._id &&
            m._id !== msg._id &&
            m.tempId &&
            msg.tempId &&
            m.tempId !== msg.tempId
        )
      );
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
    if (!msg._id) return;
    onReact?.(msg._id, emoji);
    setShowEmojiPicker(false);
  };

  const handleDelete = (deleteForEveryone) => {
    if (!msg._id) return;
    onDelete?.({ messageId: msg._id, deleteForEveryone });
    setShowDeleteOptions(false);
    setShowMenu(false);
    setShowEmojiPicker(false);
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
      ref={ref}
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
        ref={messageRef}
        className={clsx(
          "rounded-xl px-3 py-2 max-w-[75%] relative transition-all duration-200",
          msg.deletedForEveryone
            ? "bg-[#3a3a3a] text-gray-400 italic"
            : isOwnMessage
            ? "bg-[#075E54] text-white"
            : "bg-[#2a2a2a] text-white",
          isSelected && "ring-2 ring-green-500 scale-95"
        )}
      >
        {/* Inline action buttons (WhatsApp style) */}
        {!isSelectionMode && !msg.deletedForEveryone && (
          <div
            className={clsx(
              "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1",
              isOwnMessage ? "-left-20" : "-right-20"
            )}
          >
            <button
              className="p-1 rounded-full bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#333] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleReply();
              }}
              title="Reply"
            >
              <CornerUpLeft size={14} />
            </button>
            <button
              className="p-1 rounded-full bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#333] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              title="React"
            >
              <Smile size={14} />
            </button>
            <button
              className="p-1 rounded-full bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#333] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="More options"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}

        {/* Enhanced dropdown menu with animations */}
        {showMenu && !isSelectionMode && !msg.deletedForEveryone && (
          <div
            ref={dropdownRef}
            className={clsx(
              "absolute top-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200",
              dropdownPosition.openLeft ? "right-0" : "left-0"
            )}
          >
            <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
              <button
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#333] text-white w-full text-left transition-colors"
                onClick={handleReply}
              >
                <CornerUpLeft size={16} /> Reply
              </button>
              <button
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#333] text-white w-full text-left transition-colors"
                onClick={handleForward}
              >
                <CornerUpRight size={16} /> Forward
              </button>
              <button
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[#333] text-white w-full text-left transition-colors"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={16} /> React
              </button>
              {isOwnMessage && (
                <>
                  <div className="border-t border-gray-700"></div>
                  {!showDeleteOptions ? (
                    <button
                      className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-600/20 text-red-400 w-full text-left transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteOptions(true);
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : (
                    <div className="bg-[#2a2a2a] animate-in slide-in-from-top-1 duration-150">
                      <button
                        className="block w-full text-left text-sm px-4 py-2 hover:bg-[#333] text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(false);
                        }}
                      >
                        Delete for me only
                      </button>
                      <button
                        className="block w-full text-left text-sm px-4 py-2 hover:bg-red-600/20 text-red-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(true);
                        }}
                      >
                        Delete for everyone
                      </button>
                      <div className="border-t border-gray-600"></div>
                      <button
                        className="block w-full text-left text-sm px-4 py-2 hover:bg-[#555] text-gray-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteOptions(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Enhanced emoji picker with better positioning */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className={clsx(
              "absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-200",
              isOwnMessage
                ? "bottom-full right-0 mb-2"
                : "bottom-full left-0 mb-2"
            )}
          >
            <EmojiPicker
              onEmojiClick={handleReaction}
              theme="dark"
              searchDisabled
              skinTonePickerLocation="PREVIEW"
              width={300}
              height={400}
            />
          </div>
        )}

        {msg.forwardFrom && !msg.deletedForEveryone && (
          <div className="text-sm text-gray-400 mb-1 italic flex items-center gap-1">
            <CornerUpRight size={14} />
            Forwarded from: {msg.forwardFrom.name || "Unknown"}
          </div>
        )}

        {msg.replyTo && !msg.deletedForEveryone && (
          <div className="border-l-4 border-green-500 pl-3 mb-2 text-sm text-gray-300 bg-black/20 p-2 rounded-r">
            <div className="font-medium text-green-400 text-xs mb-1">
              {msg.replyTo?.sender?._id === user._id
                ? "You"
                : msg.replyTo?.sender?.name || "Unknown"}
            </div>
            <div className="truncate italic text-gray-300">
              {getReplySnippet(msg.replyTo)}
            </div>
          </div>
        )}

        {msg.deletedForEveryone ? (
          <div className="italic text-sm text-gray-400 flex items-center gap-2">
            <Trash2 size={16} />
            This message was deleted
          </div>
        ) : (
          <>
            {msg.text && (
              <div className="whitespace-pre-wrap break-words">{msg.text}</div>
            )}
            {msg.media?.url && (
              <div className="mt-2 cursor-pointer">
                {msg.media.type === "image" ? (
                  <img
                    src={msg.media.url}
                    alt="media"
                    className="max-h-52 rounded-lg hover:opacity-90 transition-opacity"
                    onClick={() =>
                      dispatch(
                        setMediaToView({ url: msg.media.url, type: "image" })
                      )
                    }
                  />
                ) : msg.media.type === "video" ? (
                  <video
                    className="max-h-52 rounded-lg"
                    controls
                    onClick={() =>
                      dispatch(
                        setMediaToView({ url: msg.media.url, type: "video" })
                      )
                    }
                  >
                    <source src={msg.media.url} type="video/mp4" />
                  </video>
                ) : (
                  <a
                    href={msg.media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline hover:text-blue-300 transition-colors flex items-center gap-2"
                  >
                    📌 File
                  </a>
                )}
              </div>
            )}
            {msg.voiceNote?.url && (
              <div className="mt-2">
                <audio
                  controls
                  src={msg.voiceNote.url}
                  className="max-w-full"
                ></audio>
              </div>
            )}

            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {/* Group reactions by emoji */}
                {Object.entries(
                  msg.reactions.reduce((acc, reaction) => {
                    if (!acc[reaction.emoji]) {
                      acc[reaction.emoji] = [];
                    }
                    acc[reaction.emoji].push(reaction);
                    return acc;
                  }, {})
                ).map(([emoji, reactions]) => (
                  <div
                    key={emoji}
                    className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-full text-sm text-white flex items-center gap-1 cursor-pointer transition-colors"
                    onClick={() => {
                      onReact?.(msg._id, emoji);
                    }}
                    title={`${reactions
                      .map((r) => r.user?.name || "Unknown")
                      .join(", ")} reacted with ${emoji}`}
                  >
                    <span>{emoji}</span>
                    {reactions.length > 1 && (
                      <span className="text-xs text-gray-300">
                        {reactions.length}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Message status indicators */}
        {isOwnMessage && !msg.deletedForEveryone && (
          <div className="-bottom-1.5 -right-2 text-[11px] flex items-center space-x-1 group relative select-none">
            {/* Time */}
            <span className="text-[11px] text-white/80 font-normal tracking-wide drop-shadow-sm">
              {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>

            {/* Status Indicator */}
            <div className="flex items-center ml-1">
              {(() => {
                const seenBy = msg.seenBy || [];
                const otherUserId = otherUser?._id;
                const senderId = msg.sender?._id;

                //  If no valid seenBy array → Single gray tick (sent only)
                if (!Array.isArray(seenBy)) {
                  return (
                    <Check
                      size={13}
                      className="text-white/50 drop-shadow-sm transition-all duration-200"
                      aria-label="Message sent"
                      strokeWidth={2.5}
                    />
                  );
                }

                if (!otherUserId || senderId === otherUserId) {
                  return (
                    <CheckCheck
                      size={13}
                      className="text-white/60 drop-shadow-sm transition-all duration-200"
                      aria-label="Message delivered"
                      strokeWidth={2.5}
                    />
                  );
                }

                const seenByIds = seenBy.map((u) =>
                  typeof u === "object" ? u._id : u
                );

                if (seenByIds.includes(otherUserId)) {
                  return (
                    <CheckCheck
                      size={13}
                      className="text-blue-400 drop-shadow-sm transition-all duration-200 hover:text-blue-300"
                      aria-label="Message seen"
                      strokeWidth={2.5}
                    />
                  );
                }

                return (
                  <CheckCheck
                    size={13}
                    className="text-white/60 drop-shadow-sm transition-all duration-200"
                    aria-label="Message delivered"
                    strokeWidth={2.5}
                  />
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
