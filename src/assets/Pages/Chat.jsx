import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) {
          setError("Invalid conversation ID");
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/messages/${chatId}`, {
          withCredentials: true,
        });

        setMessages(response.data.messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Could not load messages.");
      }
    };

    fetchMessages();
  }, [chatId]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-semibold">Chat with Friend {chatId}</h3>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {messages.map((msg) => (
            <li key={msg._id} className="border p-2 rounded">
              <strong>{msg.sender.name}</strong>: {msg.text || <i>[media]</i>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chat;
