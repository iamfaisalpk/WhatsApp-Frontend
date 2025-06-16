import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaCommentDots, FaPhoneAlt, FaCircleNotch, FaUserCircle } from 'react-icons/fa';

const AppMain = () => {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="h-screen w-full flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-16 bg-zinc-800 flex flex-col items-center py-4 space-y-6">
        <button onClick={() => setActiveTab('chats')} className={`${activeTab === 'chats' ? 'text-green-500' : ''}`}>
          <FaCommentDots size={24} />
        </button>
        <button onClick={() => setActiveTab('status')} className={`${activeTab === 'status' ? 'text-green-500' : ''}`}>
          <FaCircleNotch size={24} />
        </button>
        <button onClick={() => setActiveTab('calls')} className={`${activeTab === 'calls' ? 'text-green-500' : ''}`}>
          <FaPhoneAlt size={24} />
        </button>
        <div className="mt-auto">
          <FaUserCircle size={28} />
        </div>
      </aside>

      {/* Chat List & Chat Box */}
      <main className="flex flex-1">
        {/* Left - Chat List */}
        <div className="w-1/3 border-r border-gray-700 bg-gray-800">
          <div className="p-4 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search or start a new chat"
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
            />
          </div>

          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {/* Example chats */}
            <Link to="chats/1" className="block p-4 hover:bg-gray-700">
              <p className="font-bold">Friend 1</p>
              <p className="text-sm text-gray-400">Last message preview...</p>
            </Link>
            <Link to="chats/2" className="block p-4 hover:bg-gray-700">
              <p className="font-bold">Friend 2</p>
              <p className="text-sm text-gray-400">Last message preview...</p>
            </Link>
          </div>
        </div>

        {/* Right - Chat Window */}
        <div className="flex-1 bg-gray-900">
          {activeTab === 'chats' && <Outlet />}
          {activeTab === 'status' && (
            <div className="p-10">
              <h2 className="text-2xl font-semibold">Status</h2>
              <p>Status updates will appear here.</p>
            </div>
          )}
          {activeTab === 'calls' && (
            <div className="p-10">
              <h2 className="text-2xl font-semibold">Calls</h2>
              <p>Call history will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppMain;
