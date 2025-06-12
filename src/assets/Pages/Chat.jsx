import React from 'react';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { chatId } = useParams();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-semibold">Chat with Friend {chatId}</h3>
      <p>This is a placeholder for the chat conversation.</p>
    </div>
  );
};

export default Chat;