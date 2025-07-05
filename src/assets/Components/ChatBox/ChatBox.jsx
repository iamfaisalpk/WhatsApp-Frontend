import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ScrollToBottom from "react-scroll-to-bottom";
import { setSelectedChat } from "../../store/slices/chatSlice";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import MediaViewer from "../common/MediaViewer";
import ForwardMessageModal from "./ForwardMessageModal";
import useChatLogic from "../../../hooks/useChatLogic";


const ChatBox = () => {
  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [viewedMedia, setViewedMedia] = useState(null);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);

  const lastMessageRef = useRef(null);

  const {
    messages,
    newMessage,
    setNewMessage,
    setMessages,
    mediaFile,
    setMediaFile,
    typingUserId,
    replyToMessage,
    setReplyToMessage,
    searchText,
    setSearchText,
    selectedMessages,
    setSelectedMessages,
    isSelectionMode,
    setIsSelectionMode,
    handleSend,
    handleTyping,
    handleVoiceSend,
    addMessageSafely,
    handleReaction,
    deleteMessage,
    markChatAsSeen,
  } = useChatLogic();

  const filteredMessages = searchText
    ? messages.filter((msg) =>
        msg.text?.toLowerCase().includes(searchText.toLowerCase())
      )
    : messages;

  useEffect(() => {
    if (!lastMessageRef.current || !selectedChat?._id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          markChatAsSeen();
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(lastMessageRef.current);

    return () => {
      if (lastMessageRef.current) observer.unobserve(lastMessageRef.current);
    };
  }, [filteredMessages.length, selectedChat?._id]);

  const otherUser = useMemo(() => {
    return selectedChat?.members?.find((u) => u._id !== user._id) || {};
  }, [selectedChat, user._id]);

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0b141a]">
        <div className="text-center">
          <h2 className="text-2xl text-gray-300 mb-4">WhatsApp Web</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Send and receive messages without keeping your phone online. Use
            WhatsApp on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#161717] h-full relative">
      <div
        className="absolute inset-0 opacity-[0.60] z-0"
        style={{ backgroundImage: `url("/WhatsApp.jpg")` }}
      />

      <ChatHeader
        otherUser={otherUser}
        onBack={() => dispatch(setSelectedChat(null))}
        onSearch={setSearchText}
        onClearLocalMessages={() => setMessages([])}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedMessages.length}
        onClearSelection={() => {
          setSelectedMessages([]);
          setIsSelectionMode(false);
        }}
        onForward={() => setForwardModalOpen(true)}
      />

      <ScrollToBottom className="flex-1 overflow-y-auto px-4 py-4 z-10 relative">
        <div className="space-y-2">
          {filteredMessages.map((msg, i) => (
            <MessageBubble
              key={msg._clientKey}
              ref={i === filteredMessages.length - 1 ? lastMessageRef : null}
              msg={msg}
              isLast={i === filteredMessages.length - 1}
              index={i}
              allMessages={filteredMessages}
              user={user}
              otherUser={otherUser}
              replyToMessage={replyToMessage}
              setReplyToMessage={setReplyToMessage}
              selectedMessages={selectedMessages}
              setSelectedMessages={setSelectedMessages}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
              setViewedMedia={setViewedMedia}
              onDelete={deleteMessage}
              onReact={handleReaction}
            />
          ))}

          {typingUserId && (
            <TypingIndicator
              typingUser={selectedChat?.members?.find(
                (u) => u._id === typingUserId
              )}
            />
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
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
      />

      {/* ✅ Media Viewer */}
      {viewedMedia && (
        <MediaViewer media={viewedMedia} onClose={() => setViewedMedia(null)} />
      )}

      {/* ✅ Forward Message Modal */}
      {forwardModalOpen && (
        <ForwardMessageModal
          messages={selectedMessages}
          onClose={() => {
            setForwardModalOpen(false);
            setSelectedMessages([]);
            setIsSelectionMode(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatBox;
