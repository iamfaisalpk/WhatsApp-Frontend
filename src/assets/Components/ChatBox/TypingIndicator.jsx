import React from "react";

const TypingIndicator = ({ typingUser }) => {
  if (!typingUser || typeof typingUser.name !== "string" || typingUser.name.trim() === "") return null;

  return (
    <div className="text-sm italic text-gray-400 px-4 py-1 truncate max-w-xs">
      {typingUser.name} is typing...
    </div>
  );
};

export default TypingIndicator;
