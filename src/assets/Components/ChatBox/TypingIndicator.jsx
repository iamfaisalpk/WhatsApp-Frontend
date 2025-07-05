import React from "react";

const TypingIndicator = ({ typingUser }) => {
  if (!typingUser?.name) return null;

  return (
    <div className="text-sm italic text-gray-400 px-4 py-1">
      {typingUser.name} is typing...
    </div>
  );
};


export default TypingIndicator;
