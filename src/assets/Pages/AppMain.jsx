import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const AppMain = () => {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">WhatsApp</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1 ${activeTab === 'chats' ? 'border-b-2 border-white' : ''}`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab('status')}
            CordclassName={`px-3 py-1 ${activeTab === 'status' ? 'border-b-2 border-white' : ''}`}
          >
            Status
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3 py-1 ${activeTab === 'calls' ? 'border-b-2 border-white' : ''}`}
          >
            Calls
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="p-4">
        {activeTab === 'chats' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Chats</h2>
            <ul>
              <li>
                <Link to="chats/1">Chat with Friend 1</Link>
              </li>
              <li>
                <Link to="chats/2">Chat with Friend 2</Link>
              </li>
            </ul>
            <Outlet />
          </div>
        )}
        {activeTab === 'status' && <div><h2 className="text-2xl font-semibold">Status</h2><p>Status updates will appear here.</p></div>}
        {activeTab === 'calls' && <div><h2 className="text-2xl font-semibold">Calls</h2><p>Call history will appear here.</p></div>}
      </main>
    </div>
  );
};

export default AppMain;