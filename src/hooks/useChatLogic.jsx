import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import socket from "../../utils/socket";
import instance from "../assets/Services/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { updateSeenByInSelectedChat } from "../assets/store/slices/chatSlice";

const useChatLogic = () => {
  const { selectedChat } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [voiceNoteFile, setVoiceNoteFile] = useState(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);

  const typingTimeoutRef = useRef();
  const pendingMessagesRef = useRef(new Set());
  const processedMessageIdsRef = useRef(new Set());

  const selectedChatId = useSelector((s) => s.chat.selectedChat?._id);

  const addMessageSafely = useCallback((newMsg) => {
    setMessages((prev) => {
      if (newMsg._id) {
        const idx = prev.findIndex((msg) => msg._id === newMsg._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...newMsg };
          return updated;
        }
      }

      if (newMsg._id && newMsg.tempId) {
        const idx = prev.findIndex((msg) => msg.tempId === newMsg.tempId);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...newMsg, _clientKey: newMsg._id };
          processedMessageIdsRef.current.add(newMsg._id);
          pendingMessagesRef.current.delete(newMsg.tempId);
          return updated;
        }
      }

      if (newMsg.tempId && prev.some((msg) => msg.tempId === newMsg.tempId))
        return prev;

      if (newMsg._id) processedMessageIdsRef.current.add(newMsg._id);
      if (newMsg.tempId) pendingMessagesRef.current.add(newMsg.tempId);

      return [
        ...prev,
        {
          ...newMsg,
          _clientKey: newMsg._id || newMsg.tempId || uuidv4(),
        },
      ];
    });
  }, []);

  const markChatAsSeen = useCallback(async () => {
    if (!selectedChat?._id) return;

    try {
      const response = await instance.put("/api/messages/seen", {
        conversationId: selectedChat._id,
      });

      // Get the messageIds that were marked as seen from the response
      const seenMessageIds = response.data.messageIds || [];

      socket.emit("message-seen", {
        conversationId: selectedChat._id,
        messageIds: seenMessageIds,
        readBy: user._id,
      });

      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg._id || !seenMessageIds.includes(msg._id)) return msg;

          const seenIds = (msg.readBy || []).map((u) =>
            typeof u === "object" ? u._id : u
          );

          if (!seenIds.includes(user._id)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), user._id],
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error("Seen error:", err.message);
    }
  }, [selectedChat?._id, user._id]);

  const markMessageAsDelivered = useCallback(
    async (messageId) => {
      if (!selectedChat?._id || !messageId) return;

      try {
        // Emit delivery confirmation to sender
        socket.emit("message-delivered", {
          messageId,
          conversationId: selectedChat._id,
          deliveredTo: user._id,
        });

        // Update local state
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id === messageId) {
              const deliveredIds = (msg.deliveredTo || []).map((u) =>
                typeof u === "object" ? u._id : u
              );

              if (!deliveredIds.includes(user._id)) {
                return {
                  ...msg,
                  deliveredTo: [...(msg.deliveredTo || []), user._id],
                };
              }
            }
            return msg;
          })
        );
      } catch (err) {
        console.error("Delivery confirmation error:", err.message);
      }
    },
    [selectedChat?._id, user._id]
  );

  const handleVoiceSend = async (audioBlob, duration, replyToMessageParam) => {
    if (!selectedChat?._id || !audioBlob) return;

    const voiceFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: "audio/webm",
    });

    handleSend({
      voiceFile,
      duration,
      replyToMessage: replyToMessageParam,
    });
  };

  useEffect(() => {
    if (!selectedChat?._id) return;

    setMessages([]);
    setReplyToMessage(null);
    setSelectedMessages([]);
    setIsSelectionMode(false);
    pendingMessagesRef.current.clear();
    processedMessageIdsRef.current.clear();

    instance.get(`/api/messages/${selectedChat._id}`).then((res) => {
      const withKeys = res.data.messages.map((msg) => ({
        ...msg,
        _clientKey: msg._id || uuidv4(),
        readBy: (msg.readBy || []).map((u) =>
          typeof u === "object" ? u._id : u
        ),
        conversationParticipants: selectedChat.participants || [],
      }));

      setMessages(withKeys);
      withKeys.forEach(
        (msg) => msg._id && processedMessageIdsRef.current.add(msg._id)
      );
      markChatAsSeen();
    });
    socket.emit("join chat", selectedChat._id);
  }, [selectedChat?._id, markChatAsSeen]);

  const handleTyping = () => {
    if (!selectedChat?._id) return;
    socket.emit("typing", { conversationId: selectedChat._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { conversationId: selectedChat._id });
    }, 2000);
  };

  const handleSend = async ({
    voiceFile = voiceNoteFile,
    duration = voiceNoteDuration,
    replyToMessage: replyParam = replyToMessage,
  } = {}) => {
    if (!newMessage && !mediaFile && !voiceFile) return;

    console.log(" replyToMessage:", replyToMessage);
    console.log(" replyParam:", replyParam);

    const tempId = uuidv4();
    const tempMsg = {
      _id: null,
      tempId,
      conversationId: selectedChat._id,
      sender: user,
      text: newMessage || null,
      media: mediaFile
        ? {
            url: URL.createObjectURL(mediaFile),
            type: mediaFile.type.startsWith("image")
              ? "image"
              : mediaFile.type.startsWith("video")
              ? "video"
              : "file",
            name: mediaFile.name,
            size: mediaFile.size,
            uploading: true,
          }
        : null,

      voiceNote: voiceFile
        ? {
            url: URL.createObjectURL(voiceFile),
            duration: duration,
          }
        : null,
      createdAt: new Date().toISOString(),
      replyTo: replyParam?._id || null,
      readBy: [user._id],
    };

    addMessageSafely(tempMsg);

    const formData = new FormData();
    formData.append("conversationId", selectedChat._id);
    if (newMessage) formData.append("text", newMessage);
    if (mediaFile) formData.append("media", mediaFile);
    if (voiceFile) {
      formData.append("voiceNote", voiceFile);
      console.log(" Sending voice file:", voiceFile);
    }
    if (duration) {
      formData.append("duration", duration.toString());
      console.log(" Sending duration:", duration);
    }
    if (replyParam?._id) formData.append("replyTo", replyParam._id);
    formData.append("tempId", tempId);

    // Debug FormData contents
    console.log(" FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    setNewMessage("");
    setMediaFile(null);
    setVoiceNoteFile(null);
    setVoiceNoteDuration(0);
    setReplyToMessage(null);

    try {
      const res = await instance.post("/api/messages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const finalMsg = { ...res.data.message, tempId };

      if (!processedMessageIdsRef.current.has(finalMsg._id)) {
        addMessageSafely(finalMsg);
      }
    } catch (err) {
      console.error("Send error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      pendingMessagesRef.current.delete(tempId);
      setMessages((prev) => prev.filter((m) => m.tempId !== tempId));

      alert(
        `Failed to send message: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const existingReactions = msg.reactions || [];
            const existingIndex = existingReactions.findIndex(
              (r) => r.user._id === user._id && r.emoji === emoji
            );

            let newReactions;
            if (existingIndex > -1) {
              newReactions = existingReactions.filter(
                (_, index) => index !== existingIndex
              );
            } else {
              newReactions = [
                ...existingReactions,
                {
                  emoji,
                  user: {
                    _id: user._id,
                    name: user.name,
                    profilePic: user.profilePic,
                  },
                  createdAt: new Date(),
                },
              ];
            }

            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      );

      await instance.post(`/api/messages/react/${messageId}`, { emoji });
      socket.emit("react-message", {
        messageId,
        emoji,
        userId: user._id,
      });

      console.log(` Reaction ${emoji} sent for message ${messageId}`);
    } catch (err) {
      console.error(" Reaction error:", err.message);

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const existingReactions = msg.reactions || [];
            const existingIndex = existingReactions.findIndex(
              (r) => r.user._id === user._id && r.emoji === emoji
            );

            let revertedReactions;
            if (existingIndex > -1) {
              revertedReactions = [
                ...existingReactions,
                {
                  emoji,
                  user: {
                    _id: user._id,
                    name: user.name,
                    profilePic: user.profilePic,
                  },
                  createdAt: new Date(),
                },
              ];
            } else {
              revertedReactions = existingReactions.filter(
                (r) => !(r.user._id === user._id && r.emoji === emoji)
              );
            }

            return { ...msg, reactions: revertedReactions };
          }
          return msg;
        })
      );
    }
  };

  const deleteMessage = async ({ messageId, deleteForEveryone }) => {
    try {
      if (deleteForEveryone) {
        await instance.delete(`/api/messages/delete-message/${messageId}`);
      } else {
        await instance.post(`/api/messages/delete-for-me/${messageId}`);
      }

      socket.emit("delete-message", {
        messageId,
        conversationId: selectedChat._id,
        deleteForEveryone,
      });

      console.log(
        ` Delete request sent for message ${messageId}, deleteForEveryone: ${deleteForEveryone}`
      );
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const handleSeenUpdate = useCallback(
    ({ conversationId, readBy, messageIds }) => {
      if (conversationId !== selectedChatId || !Array.isArray(messageIds))
        return;

      dispatch(
        updateSeenByInSelectedChat({ conversationId, readBy, messageIds })
      );

      const seenUserId = typeof readBy === "object" ? readBy._id : readBy;

      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg._id || !messageIds.includes(msg._id)) return msg;

          const seenIds = (msg.readBy || []).map((u) =>
            typeof u === "object" ? u._id : u
          );

          if (!seenIds.includes(seenUserId)) {
            return {
              ...msg,
              readBy: [...(msg.readBy || []), readBy],
            };
          }

          return msg;
        })
      );
    },
    [dispatch, selectedChatId]
  );

  // main use effect logics
  useEffect(() => {
    if (!selectedChat?._id) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId !== selectedChat._id) return;
      if (processedMessageIdsRef.current.has(msg._id)) return;
      if (msg.sender._id === user._id) return; // Prevent adding own messages from socket to avoid duplication
      addMessageSafely(msg);
      markMessageAsDelivered(msg._id);
    };

    const handleDeliveryUpdate = ({ messageIds, deliveredTo }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg._id || !messageIds.includes(msg._id)) return msg;
          const deliveredIds = (msg.deliveredTo || []).map((u) =>
            typeof u === "object" ? u._id : u
          );
          if (!deliveredIds.includes(deliveredTo)) {
            return {
              ...msg,
              deliveredTo: [...(msg.deliveredTo || []), deliveredTo],
            };
          }
          return msg;
        })
      );
    };

    const handleMessageDelivered = ({ messageId, deliveredTo }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const deliveredIds = (msg.deliveredTo || []).map((u) =>
              typeof u === "object" ? u._id : u
            );
            if (!deliveredIds.includes(deliveredTo)) {
              return {
                ...msg,
                deliveredTo: [...(msg.deliveredTo || []), deliveredTo],
              };
            }
          }
          return msg;
        })
      );
    };

    const handleMessageDeleted = ({
      messageId,
      deleteForEveryone,
      conversationId,
    }) => {
      if (conversationId !== selectedChat._id) return;

      setMessages((prev) =>
        prev
          .map((msg) => {
            if (msg._id === messageId) {
              if (deleteForEveryone) {
                return {
                  ...msg,
                  text: null,
                  media: null,
                  voiceNote: null,
                  deletedForEveryone: true,
                  deletedAt: new Date(),
                };
              } else {
                return null;
              }
            }
            return msg;
          })
          .filter(Boolean)
      );

      console.log(
        ` Message ${messageId} deleted - deleteForEveryone: ${deleteForEveryone}`
      );
    };

    const handleReactionUpdate = ({
      messageId,
      emoji,
      userId: reactUserId,
      action,
      user: reactUser,
    }) => {
      console.log(` Reaction update received:`, {
        messageId,
        emoji,
        reactUserId,
        action,
      });

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const existingReactions = msg.reactions || [];

            let newReactions;
            if (action === "remove") {
              newReactions = existingReactions.filter(
                (r) => !(r.user._id === reactUserId && r.emoji === emoji)
              );
            } else {
              const existingIndex = existingReactions.findIndex(
                (r) => r.user._id === reactUserId && r.emoji === emoji
              );

              if (existingIndex === -1) {
                newReactions = [
                  ...existingReactions,
                  {
                    emoji,
                    user: reactUser || { _id: reactUserId },
                    createdAt: new Date(),
                  },
                ];
              } else {
                newReactions = existingReactions;
              }
            }

            return {
              ...msg,
              reactions: newReactions,
            };
          }
          return msg;
        })
      );
    };

    // Register all event listeners
    socket.on("message received", handleNewMessage);
    socket.on("message-delivered", handleMessageDelivered);
    socket.on("delivery-update", handleDeliveryUpdate);
    socket.on("seen-update", handleSeenUpdate);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("react-message", handleReactionUpdate);

    return () => {
      socket.off("message received", handleNewMessage);
      socket.off("message-delivered", handleMessageDelivered);
      socket.off("delivery-update", handleDeliveryUpdate);
      socket.off("seen-update", handleSeenUpdate);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("react-message", handleReactionUpdate);
    };
  }, [
    selectedChat?._id,
    user._id,
    markChatAsSeen,
    addMessageSafely,
    markMessageAsDelivered,
    handleSeenUpdate,
  ]);

  return {
    selectedChat,
    user,
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    mediaFile,
    setMediaFile,
    voiceNoteFile,
    setVoiceNoteFile,
    voiceNoteDuration,
    setVoiceNoteDuration,
    searchText,
    setSearchText,
    replyToMessage,
    setReplyToMessage,
    selectedMessages,
    setSelectedMessages,
    isSelectionMode,
    setIsSelectionMode,
    handleSend,
    handleTyping,
    handleReaction,
    deleteMessage,
    addMessageSafely,
    markChatAsSeen,
    handleVoiceSend,
  };
};

export default useChatLogic;
