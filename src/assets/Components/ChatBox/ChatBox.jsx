import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ScrollToBottom from "react-scroll-to-bottom";
import {
  setSelectedChat,
  updateSeenByInSelectedChat,
} from "../../store/slices/chatSlice";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ForwardMessageModal from "./ForwardMessageModal";
import useChatLogic from "../../../hooks/useChatLogic";
import MediaViewer from "../common/MediaViewer";
import UserInfoPopup from "./UserInfoPopup";
import GroupInfoPopup from "./GroupInfoPopup";
import socket from "../../../../utils/socket";
import GroupHeader from "./GroupHeader";
import {
  closeAllPopups,
  showUserInfo,
  showGroupInfo,
} from "../../store/slices/uiSlice";

const ChatBox = () => {
  const dispatch = useDispatch();
  const { selectedChat, chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [viewedMedia, setViewedMedia] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [infoPanelType, setInfoPanelType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const { showUserInfo: showUserInfoState, showGroupInfo: showGroupInfoState } =
    useSelector((state) => state.ui);

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

  const isGroup = selectedChat?.isGroup;

  useEffect(() => {
    if (!socket) return;

    const handleSeenUpdate = ({ conversationId, readBy, messageIds }) => {
      dispatch(
        updateSeenByInSelectedChat({
          conversationId,
          readBy: readBy,
          messageIds,
        })
      );
    };

    socket.on("seen-update", handleSeenUpdate);
    return () => {
      socket.off("seen-update", handleSeenUpdate);
    };
  }, [socket, dispatch]);

  useEffect(() => {
    const savedChat = JSON.parse(localStorage.getItem("selectedChat"));

    if (savedChat && chats?.length > 0) {
      const matchedChat = chats.find((c) => c._id === savedChat._id);

      if (matchedChat) {
        dispatch(setSelectedChat(matchedChat));
      } else {
        localStorage.removeItem("selectedChat");
      }
    }
  }, [chats]);

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
    if (
      !selectedChat?.members ||
      !Array.isArray(selectedChat.members) ||
      !user ||
      !user._id
    )
      return null;

    const others = selectedChat.members.filter(
      (u) => u && u._id && u._id !== user._id
    );

    return others.length > 0 ? others[0] : null;
  }, [selectedChat?.members, user?._id]);

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

  const showInfoPanel = showUserInfoState || showGroupInfoState;

  return (
    <div className="flex h-full bg-[#161717]">
      {/* Main Chat Column - Adjust width when info panel is open */}
      <div
        className={`flex flex-col relative transition-all duration-300 ${
          showInfoPanel ? "flex-1" : "w-full"
        }`}
      >
        {/* Chat background */}
        <div
          className="absolute inset-0 opacity-[0.60] z-0"
          style={{ backgroundImage: `url("/WhatsApp.jpg")` }}
        />

        {/* Header */}
        {isGroup ? (
          <GroupHeader
            onBack={() => dispatch(setSelectedChat(null))}
            onSearch={setSearchText}
            onClearLocalMessages={() => setMessages([])}
            onGroupInfo={() => {
              dispatch(showGroupInfo());
              setInfoPanelType("group");
            }}
          />
        ) : (
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
            onUserInfo={() => {
              dispatch(showUserInfo());
              setSelectedUser(otherUser);
              setInfoPanelType("user");
            }}
            onGroupInfo={() => {
              dispatch(showGroupInfo());
              setInfoPanelType("group");
            }}
          />
        )}

        {/* Messages */}
        <ScrollToBottom className="flex-1 overflow-y-auto px-4 py-4 z-10 relative">
          <div className="space-y-2">
            {filteredMessages.map((msg, i) => (
              <MessageBubble
                key={msg._id || msg._clientKey || i}
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
                setSelectedUser={setSelectedUser}
                setInfoPanelType={setInfoPanelType}
                setSelectedMessages={setSelectedMessages}
                isSelectionMode={isSelectionMode}
                setIsSelectionMode={setIsSelectionMode}
                setViewedMedia={setViewedMedia}
                onDelete={deleteMessage}
                onReact={handleReaction}
              />
            ))}

            {typingUserId &&
              Array.isArray(selectedChat?.members) &&
              selectedChat.members.some((u) => u?._id === typingUserId) && (
                <TypingIndicator
                  typingUser={selectedChat.members.find(
                    (u) => u?._id === typingUserId
                  )}
                />
              )}
          </div>
        </ScrollToBottom>

        {/* Chat Input */}
        {!forwardModalOpen && !showInviteModal && (
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
        )}
      </div>

      {/* Info Panel - Fixed width sidebar */}
      {!selectedChat?.isGroup && showUserInfoState && otherUser && (
        <UserInfoPopup
          user={otherUser}
          show={true}
          onClose={() => dispatch(closeAllPopups())}
        />
      )}

      {isGroup && showGroupInfoState && (
        <GroupInfoPopup 
          chat={selectedChat}
          show={true}
          onClose={() => dispatch(closeAllPopups())}
          onUpdate={() =>
            dispatch(
              setSelectedChat(chats.find((c) => c._id === selectedChat._id))
            )
          }
          showInviteModal={showInviteModal}
          setShowInviteModal={setShowInviteModal}
        />
      )}

      {/* Viewer / Modals */}
      {viewedMedia && (
        <MediaViewer media={viewedMedia} onClose={() => setViewedMedia(null)} />
      )}

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
