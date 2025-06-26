// ✅ ChatInput.jsx
import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Send, Mic, X } from "lucide-react";

const ChatInput = ({
  newMessage,
  setNewMessage,
  mediaFile,
  setMediaFile,
  onSend,
  onTyping,
  onVoiceSend,
}) => {
  const fileInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
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

  return (
    <div className="p-2 bg-[#1e1e1e] flex flex-col gap-2 z-50">
      {mediaFile && (
        <div className="flex items-center gap-3 bg-[#2b2b2b] text-white p-2 rounded-lg relative">
          <span className="text-sm font-medium truncate max-w-[70%]">
            {mediaFile.name}
          </span>
          <button
            onClick={() => setMediaFile(null)}
            className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isRecording && (
        <div className="text-blue-400 text-sm font-mono pl-1 animate-pulse">
          🎙️ Recording... {formatTime(recordTime)}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current.click()}
          className="text-gray-400 hover:text-white"
          title="Attach file"
        >
          <Paperclip />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleFileChange}
        />

        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 px-3 py-2 bg-[#2a2a2a] text-white rounded-full outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {newMessage || mediaFile ? (
          <button
            onClick={onSend}
            className="text-green-500 hover:text-green-400"
            title="Send message"
          >
            <Send />
          </button>
        ) : (
          <button
            onClick={handleVoiceRecording}
            className={`text-blue-400 ${isRecording ? "animate-ping" : ""}`}
            title="Record voice"
          >
            <Mic />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
