
import React, { useRef, useState, useEffect } from "react";
import {
  Plus,
  Send,
  Mic,
  X,
  CornerUpLeft,
  Smile,
  Image as ImageIcon,
  FileText,
  Camera,
  Headphones,
  User,
  BarChart,
  Calendar,
} from "lucide-react";

const AttachmentOption = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 text-white hover:bg-[#3a3a3a] px-4 py-3 rounded-lg text-sm transition-all duration-200 hover:scale-105 w-full"
  >
    <div className="w-5 h-5 flex items-center justify-center">
      {icon}
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

const ChatInput = ({
  newMessage,
  setNewMessage,
  mediaFile,
  setMediaFile,
  onSend = () => {},
  onTyping = () => {},
  onVoiceSend = () => {},
  replyToMessage,
  setReplyToMessage,
}) => {
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (
        mediaRecorderRef.current &&
        typeof mediaRecorderRef.current.stop === "function" &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (secs) => {
    const min = String(Math.floor(secs / 60)).padStart(2, "0");
    const sec = String(secs % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setMediaFile(file);
    setShowAttachmentMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    } else {
      onTyping();
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(intervalRef.current);
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        onVoiceSend(audioBlob, recordTime);
        setRecordTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      let sec = 0;
      intervalRef.current = setInterval(() => {
        sec += 1;
        setRecordTime(sec);
      }, 1000);
    } catch (err) {
      console.error("Voice recording error:", err);
    }
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-2 bg-transparent flex flex-col gap-2 z-50 relative w-full">
      {/* Reply UI */}
      {replyToMessage && (
        <div className="flex items-start justify-between bg-gradient-to-r from-[#2a2a2a] to-[#2f2f2f] p-4 rounded-xl text-white border border-[#3a3a3a] shadow-lg">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <CornerUpLeft size={16} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-green-400 text-sm mb-1">
                Replying to {replyToMessage.sender?.name || "You"}
              </div>
              <div className="text-gray-300 text-sm truncate">
                {replyToMessage.text || "📎 Media/Voice Note"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setReplyToMessage(null)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer"
            title="Cancel reply"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* File preview */}
      {mediaFile && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#2b2b2b] to-[#303030] text-white p-4 rounded-xl border border-[#3a3a3a] shadow-lg relative">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <ImageIcon size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white mb-1">Attached File</div>
            <div className="text-xs text-gray-400 truncate">{mediaFile.name}</div>
          </div>
          <button
            onClick={() => setMediaFile(null)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all duration-200 flex-shrink-0"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Recording UI */}
      {isRecording && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-green-500/20 text-white p-4 rounded-xl border border-blue-500/30 shadow-lg">
          <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-400 mb-1">Recording Audio</div>
            <div className="text-xs text-gray-300 font-mono">{formatTime(recordTime)}</div>
          </div>
        </div>
      )}

      {/* Main Input Container */}
      <div className="flex items-center gap-2 bg-[#202020] px-3 py-2 rounded-xl border border-[#2e2e2e]">
        {/* Attachments Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className="w-10 h-10 bg-[#3a3a3a] hover:bg-[#404040] rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Plus size={20} className="cursor-pointer" />
          </button>

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-14 left-0 bg-[#2a2a2a] rounded-2xl shadow-2xl z-50 p-3 w-64 border border-[#3a3a3a] backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                <AttachmentOption 
                  icon={<FileText size={20} className="cursor-pointer" />} 
                  label="Document" 
                  onClick={() => fileInputRef.current?.click()} 
                />
                <AttachmentOption 
                  icon={<ImageIcon size={20} className="cursor-pointer" />} 
                  label="Photos & Videos" 
                  onClick={() => fileInputRef.current?.click()} 
                />
                <AttachmentOption 
                  icon={<Camera size={20} className="cursor-pointer" />} 
                  label="Camera" 
                  onClick={() => alert("Camera not implemented")} 
                />
                <AttachmentOption 
                  icon={<Headphones size={20} className="cursor-pointer" />} 
                  label="Audio" 
                  onClick={() => alert("Audio coming soon")} 
                />
                <AttachmentOption 
                  icon={<User size={20} className="cursor-pointer" />} 
                  label="Contact" 
                  onClick={() => alert("Contact sharing soon")} 
                />
                <AttachmentOption 
                  icon={<BarChart size={20} className="cursor-pointer" />} 
                  label="Poll" 
                  onClick={() => alert("Poll coming soon")} 
                />
                <AttachmentOption 
                  icon={<Calendar size={20} className="cursor-pointer" />} 
                  label="Event" 
                  onClick={() => alert("Event coming soon")} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="w-10 h-10 bg-[#3a3a3a] hover:bg-[#404040] rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Smile size={20} className="cursor-pointer" />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleFileChange}
        />

        {/* Message Input */}
        <div className="flex-1 bg-[#1a1a1a] rounded-xl px-4 py-3 border border-[#3a3a3a] focus-within:border-green-600 transition-all duration-200">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm py-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Send/Mic Button */}
        {newMessage || mediaFile ? (
          <button 
            onClick={onSend} 
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
          >
            <Send size={20} className="cursor-pointer" />
          </button>
        ) : (
          <button
            onClick={handleVoiceRecording}
            className={`w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg ${
              isRecording ? "animate-pulse bg-red-500" : ""
            }`}
            title="Record voice message"
          >
            <Mic size={20} className="cursor-pointer" />
          </button>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-24 left-4 z-50 rounded-2xl overflow-hidden border border-[#3a3a3a] shadow-2xl">
          <div className="bg-[#2a2a2a] p-4 text-white text-sm font-medium border-b border-[#3a3a3a]">
            Choose an emoji
          </div>
          <div className="max-h-80 overflow-y-auto">
            {/* Simplified emoji picker - you can integrate a real one */}
            <div className="grid grid-cols-8 gap-2 p-4 bg-[#2a2a2a]">
              {['😀', '😂', '😍', '🤔', '👍', '❤️', '🔥', '✨', '🎉', '😎', '🤗', '😊', '🙏', '💯', '🎯', '⚡'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiClick({ emoji })}
                  className="w-10 h-10 text-xl hover:bg-[#3a3a3a] rounded-lg transition-all duration-200 hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;