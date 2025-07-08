import React, { useRef, useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Plus,
  Send,
  Mic,
  X,
  CornerUpLeft,
  Smile,
  Image,
  FileText,
  Camera,
  Headphones,
  User,
  BarChart,
  Calendar,
  Paperclip,
} from "lucide-react";

const AttachmentOption = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-white hover:bg-[#202020] px-3 py-2 rounded-md text-sm font-normal transition-all duration-200 w-full cursor-pointer"
  >
    <div className="w-5 h-6 flex items-center justify-center rounded-full">
      {icon}
    </div>
    <span>{label}</span>
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
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const attachmentMenuRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const recordTimeRef = useRef(0);
  const [readyToSendVoice, setReadyToSendVoice] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target)
      ) {
        setShowAttachmentMenu(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setShowAttachmentMenu(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

        if (!audioBlob || audioBlob.size === 0 || recordTimeRef.current < 1) {
          console.warn("🚫 Skipping voice note send: Invalid blob or duration");
          return;
        }

        onVoiceSend(audioBlob, recordTimeRef.current);
        setRecordTime(0);
        recordTimeRef.current = 0;
      };

      mediaRecorder.start();
      setIsRecording(true);

      let sec = 0;
      intervalRef.current = setInterval(() => {
        sec += 1;
        setRecordTime(sec);
        recordTimeRef.current = sec;
      }, 1000);
    } catch (err) {
      console.error("Voice recording error:", err);
      alert(
        "Microphone access denied. Please allow microphone access to record voice messages."
      );
    }
  };

  const cancelVoiceRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(intervalRef.current);
    setIsRecording(false);
    setRecordTime(0);
    recordTimeRef.current = 0;
    audioChunks.current = [];
  };

  // Updated emoji handler for emoji-picker-react
  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const getFileTypeIcon = (file) => {
    if (!file) return <FileText size={18} className="text-blue-400" />;

    const type = file.type;
    if (type.startsWith("image/")) {
      return <Image size={18} className="text-green-400" />;
    } else if (type.startsWith("video/")) {
      return <Camera size={18} className="text-red-400" />;
    } else if (type.startsWith("audio/")) {
      return <Headphones size={18} className="text-purple-400" />;
    } else if (type === "application/pdf") {
      return <FileText size={18} className="text-red-400" />;
    } else {
      return <FileText size={18} className="text-blue-400" />;
    }
  };

  const getFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-3 bg-transparent flex flex-col gap-3 z-50 relative w-full">
      {/* Reply UI */}
      {replyToMessage && (
        <div className="flex items-start justify-between bg-gradient-to-r from-[#2a2a2a] to-[#2f2f2f] p-4 rounded-2xl text-white border border-[#3a3a3a] shadow-lg">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-1 h-12 bg-green-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-green-400 text-sm mb-1">
                {replyToMessage.sender?.name || "You"}
              </div>

              {/* Smart content display */}
              <div className="text-gray-300 text-sm flex items-center gap-1 truncate">
                {replyToMessage.text ? (
                  <span>{replyToMessage.text}</span>
                ) : replyToMessage.media ? (
                  <>
                    <span role="img" aria-label="media"></span>
                    <span>Media File</span>
                  </>
                ) : replyToMessage.voice ? (
                  <>
                    <span role="img" aria-label="voice"></span>
                    <span>Voice Message</span>
                  </>
                ) : (
                  <span> voice Message</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setReplyToMessage(null)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all duration-200 flex-shrink-0"
          >
            <X size={16} className="cursor-pointer" />
          </button>
        </div>
      )}

      {mediaFile && (
        <div className="mb-2 p-3 bg-[#1e1e1e] rounded-2xl border border-[#3a3a3a] shadow-lg relative">
          {/* Close preview */}
          <button
            onClick={() => setMediaFile(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
          >
            <X size={16} className="cursor-pointer" />
          </button>

          {/* Show preview by file type */}
          {mediaFile.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(mediaFile)}
              alt="preview"
              className="max-h-60 rounded-lg mx-auto"
            />
          )}
          {mediaFile.type.startsWith("video/") && (
            <video
              src={URL.createObjectURL(mediaFile)}
              controls
              className="max-h-60 rounded-lg mx-auto"
            />
          )}
          {mediaFile.type.startsWith("audio/") && (
            <audio
              src={URL.createObjectURL(mediaFile)}
              controls
              className="w-full"
            />
          )}
          {!mediaFile.type.startsWith("image/") &&
            !mediaFile.type.startsWith("video/") &&
            !mediaFile.type.startsWith("audio/") && (
              <div className="text-white flex items-center gap-3">
                <Paperclip size={18} />
                <span>{mediaFile.name}</span>
              </div>
            )}

          <div className="text-xs text-gray-400 mt-2">
            {mediaFile.name} • {(mediaFile.size / 1024).toFixed(1)} KB
          </div>
        </div>
      )}

      {/* Recording UI */}
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#161717] text-white shadow-md border border-[#128C7E]/50 animate-fade-in">
          {/* Animated Mic Pulse */}
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
            <div className="relative w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
          </div>

          {/* Timer Text */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <span className="text-sm text-white font-semibold">
              Recording...
            </span>
            <span className="text-xs text-gray-200 font-mono">
              {formatTime(recordTime)}
            </span>
          </div>

          {/* Cancel Button */}
          <button
            onClick={cancelVoiceRecording}
            className="ml-2 p-2 rounded-full hover:bg-red-600/20 transition-all duration-150"
            title="Cancel recording"
          >
            <X className="text-red-500 w-4 h-4 cursor-pointer" />
          </button>
        </div>
      )}

      {/* Main Input Container */}
      <div className="flex items-end gap-2 bg-[#2a2a2a] px-1 py-1 rounded-2xl border border-[#3a3a3a] shadow-lg">
        {/* Attachments Button */}
        <div className="relative" ref={attachmentMenuRef}>
          <button
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className={`w-10 h-10 bg-[#3a3a3a] rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 m-1`}
          >
            <Plus
              size={20}
              className={`transform transition-transform duration-200 cursor-pointer ${
                showAttachmentMenu ? "rotate-45" : ""
              }`}
            />
          </button>

          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-12 left-0 bg-[#101010] rounded-xl shadow-2xl z-50 p-2 w-64 border border-[#2a2a2a]">
              <div className="flex flex-col gap-1">
                <AttachmentOption
                  icon={<FileText size={16} className="text-purple-400" />}
                  label="Document"
                  onClick={() => documentInputRef.current?.click()}
                />
                <AttachmentOption
                  icon={<Image size={16} className="text-blue-400" />}
                  label="Photos & Videos"
                  onClick={() => imageInputRef.current?.click()}
                />
                <AttachmentOption
                  icon={<Camera size={16} className="text-pink-500" />}
                  label="Camera"
                  onClick={() => alert("Camera feature coming soon")}
                />
                <AttachmentOption
                  icon={<Headphones size={16} className="text-orange-400" />}
                  label="Audio"
                  onClick={() => audioInputRef.current?.click()}
                />
                <AttachmentOption
                  icon={<User size={16} className="text-cyan-400" />}
                  label="Contact"
                  onClick={() => alert("Contact sharing coming soon")}
                />
                <AttachmentOption
                  icon={<BarChart size={16} className="text-yellow-400" />}
                  label="Poll"
                  onClick={() => alert("Poll feature coming soon")}
                />
                <AttachmentOption
                  icon={<Calendar size={16} className="text-pink-400" />}
                  label="Event"
                  onClick={() => alert("Event feature coming soon")}
                />
                <AttachmentOption
                  icon={<Plus size={16} className="text-green-500" />}
                  label="New sticker"
                  onClick={() => alert("Sticker upload coming soon")}
                />
              </div>
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => handleFileChange(e, "media")}
        />
        <input
          type="file"
          ref={documentInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
          onChange={(e) => handleFileChange(e, "document")}
        />
        <input
          type="file"
          ref={audioInputRef}
          className="hidden"
          accept="audio/*"
          onChange={(e) => handleFileChange(e, "audio")}
        />

        {/* Message Input Container */}
        <div className="flex-1 bg-[#1a1a1a] rounded-2xl px-4 py-3 border border-[#3a3a3a] focus-within:border-green-500/50 transition-all duration-200 min-h-[44px] flex items-center">
          <textarea
            placeholder="Type a message..."
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm resize-none max-h-32 overflow-y-auto"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="1"
            style={{
              height: "auto",
              minHeight: "20px",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
          />
        </div>

        {/* Emoji Button */}
        <div className="relative cursor-pointer" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`w-10 h-10 ${
              showEmojiPicker ? "" : "bg-[#3a3a3a]"
            }  rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 m-1`}
          >
            <Smile size={20} className="cursor-pointer" />
          </button>

          {/* Updated Emoji Picker using emoji-picker-react */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50 cursor-pointer">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                height={400}
                width={350}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: false,
                }}
                style={{
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #3a3a3a",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
              />
            </div>
          )}
        </div>

        {/* Send/Mic Button */}
        {newMessage.trim() || mediaFile ? (
          <button
            onClick={onSend}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg m-1"
          >
            <Send size={20} />
          </button>
        ) : readyToSendVoice ? (
          <button
            onClick={() => {
              onVoiceSend(voiceBlob, recordTimeRef.current);
              setReadyToSendVoice(false);
              setVoiceBlob(null);
            }}
            className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg m-1 cursor-pointer"
          >
            <Send size={20} className="cursor-pointer" />
          </button>
        ) : (
          <button
            onClick={handleVoiceRecording}
            className={`w-12 h-12 bg-gradient-to-r cursor-pointer ${
              isRecording
                ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                : "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            } rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg m-1 ${
              isRecording ? "animate-pulse" : ""
            }`}
          >
            {isRecording ? <Send size={20} /> : <Mic size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
