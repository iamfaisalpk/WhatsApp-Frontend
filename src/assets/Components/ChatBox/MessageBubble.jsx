import {
  MoreVertical,
  Check,
  CheckCheck,
  CornerUpLeft,
  CornerUpRight,
  Smile,
  Trash2,
  File,
  FileText,
  FileCode,
  FileArchive,
  FileImage,
  FileVideo,
  FileAudio,
  Paperclip,
} from "lucide-react";
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import React, { useState, useRef, useEffect, forwardRef } from "react";
import VoiceMessagePlayer from "./VoiceMessagePlayer";
import { Link, useNavigate } from "react-router-dom";

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
    setViewedMedia,
    setSelectedUser,
    setInfoPanelType,
  } = props;

  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ openLeft: false });
  const currentUserId = useSelector((state) => state.auth.user?._id || null);

  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageRef = useRef(null);

  const getLucideFileIcon = (type = "") => {
    if (type.includes("image")) return <FileImage size={18} />;
    if (type.includes("video")) return <FileVideo size={18} />;
    if (type.includes("audio")) return <FileAudio size={18} />;
    if (type.includes("pdf")) return <FileText size={18} />;
    if (type.includes("zip") || type.includes("rar"))
      return <FileArchive size={18} />;
    if (type.includes("doc") || type.includes("word"))
      return <FileText size={18} />;
    if (type.includes("xls") || type.includes("sheet"))
      return <FileText size={18} />;
    if (type.includes("code")) return <FileCode size={18} />;
    return <Paperclip size={18} />;
  };

  const extractInviteToken = (url) => {
    try {
      const parts = url.split("/preview/");
      return parts[1];
    } catch {
      return "";
    }
  };

  const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    if (reply.media?.type === "image") return " Photo";
    if (reply.media?.type === "video") return " Video";
    if (reply.voiceNote) return " Voice Note";
    return " File";
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
              "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 ",
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
              <CornerUpLeft size={16} className="cursor-pointer" />
            </button>
            <button
              className="p-1 rounded-full bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#333] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              title="React"
            >
              <Smile size={16} className="cursor-pointer" />
            </button>
            <button
              className="p-1 rounded-full bg-[#1e1e1e] text-gray-300 hover:text-white hover:bg-[#333] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="More options"
            >
              <MoreVertical size={16} className="cursor-pointer" />
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
            {msg.groupLink && (
              <div
                className={clsx(
                  "group-link-preview rounded-md p-3 mb-2 border border-green-500 bg-green-900 text-white",
                  isOwnMessage ? "text-right" : "text-left"
                )}
              >
                <div className="font-semibold mb-1">Group Invite Link</div>

                {/* ✅ Use Link from react-router-dom instead of window.open or <a> */}
                <Link
                  to={`/preview/${extractInviteToken(msg.groupLink)}`}
                  className="truncate underline text-blue-300 hover:text-blue-400"
                >
                  {msg.groupLink}
                </Link>
              </div>
            )}

            {msg.text && (
              <div className="whitespace-pre-wrap break-words">
                {
                  msg.text.split(" ").map((word, index) => {
                    if (
                      word.startsWith("http://") ||
                      word.startsWith("https://")
                    ) {
                      const isGroupInvite = word.includes("/preview/");
                      return isGroupInvite ? (
                        <Link
                          key={index}
                          to={`/preview/${extractInviteToken(word)}`}
                          className="text-blue-400 underline hover:text-blue-500 mr-1"
                        >
                          {word}
                        </Link>
                      ) : (
                        <Link
                          key={index}
                          href={word}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline mr-1"
                        >
                          {word}
                        </Link>
                      );
                    }
                    return (
                      <span key={index} className="mr-1">
                        {word}
                      </span>
                    );
                  })
                }
              </div>
            )}

            {msg.media?.url && (
              <div className="mt-2 cursor-pointer">
                {msg.media.uploading ? (
                  <div className="relative w-44 h-44 rounded-lg overflow-hidden border border-gray-600 bg-black/20">
                    <img
                      src={msg.media.url}
                      alt="upload-preview"
                      className="w-full h-full object-cover blur-sm opacity-60"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-green-400 border-t-transparent animate-spin rounded-full"></div>
                      <span className="text-xs text-white mt-2">
                        Uploading...
                      </span>
                    </div>
                  </div>
                ) : msg.media.type === "image" ? (
                  <img
                    src={msg.media.url}
                    alt="media"
                    className="max-h-52 rounded-lg hover:opacity-90 transition-opacity"
                    onClick={() =>
                      setViewedMedia({ url: msg.media.url, type: "image" })
                    }
                  />
                ) : msg.media.type === "video" ? (
                  <video
                    className="max-h-52 rounded-lg"
                    controls
                    onClick={() =>
                      setViewedMedia({ url: msg.media.url, type: "video" })
                    }
                  >
                    <source src={msg.media.url} type="video/mp4" />
                  </video>
                ) : (
                  <a
                    href={msg.media.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-gray-600 rounded-md text-white bg-black/30 hover:bg-black/50 transition-colors"
                    title={msg.media.name || "Download"}
                  >
                    {getLucideFileIcon(msg.media.type)}
                    <div className="flex flex-col text-left">
                      <span className="truncate max-w-[160px]">
                        {msg.media.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatFileSize(msg.media.size)}
                      </span>
                    </div>
                  </a>
                )}
              </div>
            )}

            {msg.voiceNote?.url && !msg.deletedForEveryone && currentUserId && (
              <div className="mt-2 flex flex-col gap-2">
                <VoiceMessagePlayer
                  url={msg.voiceNote.url}
                  duration={msg.voiceNote.duration}
                  profilePic={msg.sender?.profilePic}
                  isSender={msg.sender?._id === currentUserId}
                />
              </div>
            )}

            {!isOwnMessage && msg.sender?.profilePic && (
              <img
                src={msg.sender.profilePic}
                alt="Sender"
                className="w-6 h-6 rounded-full absolute -left-8 top-1 cursor-pointer border border-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(msg.sender);
                  setInfoPanelType("user");
                }}
              />
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
                const readBy = msg.readBy || [];
                const otherUserId = otherUser?._id;
                const senderId = msg.sender?._id;

                if (!Array.isArray(readBy)) {
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

                const seenByIds = readBy.map((u) =>
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
