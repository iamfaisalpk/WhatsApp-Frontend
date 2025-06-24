import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  UserCircle,
  Archive,
  MessageSquarePlus,
  Bell,
  Settings,
  LogOut,
  MoreVertical,
  Users,
  Target,
  MessageCircleCode,
  X,
  Lock,
  MessageSquareText,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const AppMain = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [activeIcon, setActiveIcon] = useState("Chats");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname === "/app/profile";

  const tabs = [
    { id: "All", label: "All" },
    { id: "Unread", label: "Unread" },
    { id: "Favorites", label: "Favorites" },
    { id: "Groups", label: "Groups" },
  ];

  const sidebarIcons = [
    { icon: MessageSquareText, label: "Chats", route: "/app" },
    { icon: Target, label: "Status" },
    { icon: MessageCircleCode, label: "Calls" },
    { icon: Users, label: "Communities" },
    { icon: Settings, label: "Settings" },
  ];

  const menuItems = [
    { icon: Users, label: "New group", action: () => {} },
    { icon: UserCircle, label: "New contact", action: () => {} },
    { icon: Archive, label: "Archived", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Settings, label: "Settings", action: () => {} },
    { icon: LogOut, label: "Log out", action: () => {} },
  ];

  return (
    <div className="h-screen w-full flex bg-[#111b21] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[60px] bg-[#212222] flex flex-col items-center py-3 relative z-10 overflow-visible">
        <div className="flex flex-col space-y-1">
          {sidebarIcons.map((item, index) => (
            <div
              key={index}
              className="relative group flex justify-center"
              onClick={() => {
                item.route && navigate(item.route);
                setActiveIcon(item.label);
              }}
            >
              <button
                className={`w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-[#494a4a] 
                  cursor-pointer hover:text-white ${
                    activeIcon === item.label
                      ? "bg-[#494a4a] text-white"
                      : "text-[#aebac1] hover:bg-[#494a4a]"
                  }`}
              >
                <item.icon size={20} />
              </button>
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-white text-black text-xs px-4 py-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-50">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Profile Avatar */}
        <div className="mt-auto mb-2">
          <div
            className="relative group flex justify-center"
            onClick={() => {
              navigate("/app/profile");
              setActiveIcon("Profile");
            }}
          >
            <div
              className={`w-8 h-8 rounded-full overflow-hidden cursor-pointer flex items-center justify-center ${
                activeIcon === "Profile"
                  ? "bg-[#494a4a] text-white"
                  : "text-[#aebac1]  hover:bg-[#494a4a] hover:text-white"
              }`}
            >
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <UserCircle className="w-5 h-5" />
              )}
            </div>
            <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-white text-black text-xs px-4 py-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-50 pointer-events-none">
              Profile
            </span>
          </div>
        </div>
      </div>

      {/* Center Chat List Panel */}
      {!isProfilePage && (
        <div className="w-[420px] bg-[#161717] flex flex-col relative border-l border-r border-white/15 shadow-inner shadow-white/5">
          <div className="bg-[#161717] px-4 py-4 flex items-center justify-between">
            <h1 className="text-white text-2xl font-semibold">WhatsApp</h1>
            <div className="flex items-center space-x-1">
              <button className="p-2 rounded-full hover:bg-[#075E54] text-[#ECE5DD] hover:text-white">
                <MessageSquarePlus size={20} />
              </button>
              <button
                className="p-2 rounded-full hover:bg-[#075E54] text-[#ECE5DD] hover:text-white"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute top-16 right-4 bg-[#075E54] rounded-md shadow-lg py-1 z-50 min-w-[180px] border border-[#128C7E]">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-[#128C7E] text-white text-sm cursor-pointer"
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="px-3 py-2 bg-[#161717]">
            <div className="flex items-center bg-[#2a2f32] rounded-full px-4 py-2 border-2 border-transparent hover:border-white/25 focus-within:border-[#25D366] focus-within:bg-[#161717]">
              <Search className="w-4 h-4 text-[#8696a0] mr-4" />
              <input
                type="text"
                placeholder="Search or start a new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-[#8696a0] hover:text-[#e9edef]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="px-3 pb-1 bg-[#161717]">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 text-sm rounded-full border cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#024639] text-[#c8f9f0] border-transparent"
                      : "text-[#e9edef] border-white/15 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-[#ECE5DD] text-sm mb-2">No chats</p>
            <button className="text-[#25D366] text-sm hover:underline cursor-pointer">
              View all chats
            </button>
          </div>
        </div>
      )}

      {/* Right Section */}
      {isProfilePage ? (
        <div className="flex-1 bg-[#161717] overflow-y-auto">
          <Outlet />
        </div>
      ) : (
        <div className="flex-1 bg-[#161717] flex flex-col items-center justify-center px-6">
          <div className="text-center max-w-md w-full">
            <div className="w-80 h-60 mx-auto mb-4">
              <img
                src="/WhatsAppWeb.png"
                alt="WhatsApp"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-white text-3xl font-light mb-4">
              Download WhatsApp for Windows
            </h2>
            <p className="text-[#989796] text-base mb-8">
              Make calls, share your screen and get a faster experience when you
              download the Windows app.
            </p>
            <button className="bg-[#048d36] text-white font-medium px-5 py-3 rounded-full shadow-lg hover:shadow-xl cursor-pointer">
              Download
            </button>
            <div className="flex items-center justify-center text-[#ECE5DD] text-sm mt-12">
              <Lock size={16} className="mr-2" />
              <span>Your personal messages are end-to-end encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMain;
