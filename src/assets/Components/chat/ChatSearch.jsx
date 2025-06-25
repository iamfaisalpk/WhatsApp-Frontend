import React, { useState } from "react";

const ChatSearch = ({ onSearch, onClose }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="absolute right-0 mt-2 w-52 bg-[#233138] text-white rounded-md shadow-lg z-30 p-2">
      <input
        type="text"
        placeholder="Search message..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-1 rounded bg-[#111b21] text-sm outline-none"
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="text-[#25D366] hover:underline text-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default ChatSearch;
