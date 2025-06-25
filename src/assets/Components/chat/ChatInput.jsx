import React, { useRef } from "react";
import { Paperclip, Mic, Send, X } from "lucide-react";

const ChatInput = ({
  newMessage,
  setNewMessage,
  mediaFile,
  setMediaFile,
  onSend,
  onTyping,
}) => {
  const fileRef = useRef(null);

  return (
    <div className="px-4 py-3 bg-[#2a2f32] relative z-10 border-t border-[#2a3942]">
      {mediaFile && (
        <div className="mb-2 flex items-center justify-between bg-[#1e1e1e] px-3 py-2 rounded">
          <div className="flex items-center gap-3 text-white text-sm">
            <img
              src={URL.createObjectURL(mediaFile)}
              alt="preview"
              className="w-10 h-10 object-cover rounded"
            />
            <span>{mediaFile.name}</span>
          </div>
          <button
            onClick={() => setMediaFile(null)}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Emoji */}
        <button className="text-[#8696a0] hover:text-white p-2">
          😊
        </button>

        {/* Media Upload */}
        <button
          onClick={() => fileRef.current?.click()}
          className="text-[#8696a0] hover:text-white p-2"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,application/pdf,audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) setMediaFile(file);
          }}
        />

        {/* Message Input */}
        <div className="flex-1 bg-[#2a3942] rounded-lg">
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              onTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            className="w-full px-4 py-3 bg-transparent text-white outline-none placeholder-[#8696a0] text-sm"
          />
        </div>

        {/* Send or Mic button */}
        <button
          onClick={onSend}
          className={`p-3 rounded-full transition-colors ${
            newMessage.trim() || mediaFile
              ? "bg-[#00a884] hover:bg-[#00947a] text-white"
              : "text-[#8696a0] hover:text-white"
          }`}
        >
          {newMessage.trim() || mediaFile ? <Send size={18} /> : <Mic size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
