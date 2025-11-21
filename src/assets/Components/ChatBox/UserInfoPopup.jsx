import React, { useEffect, useState } from "react";
import {
  X,
  MessageSquare,
  Phone,
  Video,
  Search,
  Heart,
  Bell,
  BellOff,
  MessageCircle,
  Shield,
  Lock,
  Trash2,
  UserMinus,
} from "lucide-react";
import instance from "../../Services/axiosInstance";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const UserInfoPopup = ({ user, onClose, show = true }) => {
  const { user: currentUser } = useSelector((s) => s.auth);
  const [sharedGroups, setSharedGroups] = useState([]);

  useEffect(() => {
    const fetchSharedGroups = async () => {
      try {
        if (!user?._id) return;
        const res = await instance.get(`/api/chat/shared-groups/${user._id}`);
        setSharedGroups(res.data.groups || []);
      } catch (err) {
        console.error("Error fetching shared groups:", err);
      }
    };
    fetchSharedGroups();
  }, [user]);

  if (!user) return null;

    const menuItems = [
    { icon: MessageSquare, label: "Media, links and docs", count: 0 },
    { icon: MessageCircle, label: "Starred messages" },
    { icon: Bell, label: "Mute notifications", toggle: true },
    { icon: MessageSquare, label: "Disappearing messages", status: "Off" },
    { icon: Shield, label: "Advanced chat privacy" },
    {
        icon: Lock,
        label: "Encryption",
        subtitle: "Messages are end-to-end encrypted. Click to verify.",
    },
  ];

  return (
    <AnimatePresence>
        <motion.div 
        key="user-info-popup"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
            }}
        className="w-[380px] h-full bg-[#161717] text-white shadow-lg border-l border-[#2a3942] flex-shrink-0 overflow-hidden">
        {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-[#2a3942]">
        <h2 className="text-lg font-medium">Contact info</h2>
        <X
          size={20}
          className="cursor-pointer text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
        />
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto h-[calc(100%-72px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center p-6">
          <img
            src={user.profilePic || "/default-avatar.png"}
            alt={user.name || "User"}
            className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-[#2a3942]"
          />
          <h3 className="text-xl font-semibold mb-1">{user.name}</h3>
          <p className="text-sm text-gray-400">{user.phone}</p>
        </div>

        {/* About Section */}
        <div className="px-4 py-3 border-b border-[#2a3942]">
          <p className="text-sm text-gray-400 mb-2">About</p>
          <div className="text-sm text-[#e9edef]">
            {user.about || "Hey there! I am using PK.Chat"}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 hover:bg-[#2a3942] cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className="text-[#8696a0]" />
                <div>
                  <p className="text-sm text-[#e9edef]">{item.label}</p>
                  {item.subtitle && (
                    <p className="text-xs text-[#8696a0] mt-1">{item.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.count !== undefined && (
                  <span className="text-sm text-[#8696a0]">{item.count}</span>
                )}
                {item.status && (
                  <span className="text-sm text-[#8696a0]">{item.status}</span>
                )}
                {item.toggle && (
                  <div className="w-10 h-6 bg-[#2a3942] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-[#8696a0] rounded-full absolute top-1 left-1 transition-transform"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Shared Groups Section */}
        {sharedGroups.length > 0 && (
          <div className="px-4 py-3 border-t border-[#2a3942]">
            <p className="text-sm text-gray-400 mb-3">
              {sharedGroups.length} groups in common
            </p>
            <div className="space-y-2">
              {sharedGroups.map((group) => (
                <div
                  key={group._id}
                  className="flex items-center space-x-3 py-2 hover:bg-[#2a3942] cursor-pointer rounded transition-colors"
                >
                  <img
                    src={group.groupAvatar || "/default-avatar.png"}
                    alt={group.groupName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e9edef] truncate">{group.groupName}</p>
                    <p className="text-xs text-[#8696a0] truncate">
                      {group.members
                        .map((m) => m.name)
                        .filter((n) => n !== currentUser.name)
                        .slice(0, 3)
                        .join(", ")}
                      {group.members.length > 4 &&
                        `, +${group.members.length - 4} more`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-3 border-t border-[#2a3942] space-y-2">
          <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
            <Heart size={20} className="text-[#8696a0]" />
            <span className="text-sm text-[#e9edef]">Add to favorites</span>
          </button>

          <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
            <UserMinus size={20} className="text-[#8696a0]" />
            <span className="text-sm text-[#e9edef]">Block {user.name}</span>
          </button>

          <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
            <MessageCircle size={20} className="text-[#8696a0]" />
            <span className="text-sm text-[#e9edef]">Report {user.name}</span>
          </button>

          <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors text-red-400">
            <Trash2 size={20} className="text-red-400" />
            <span className="text-sm">Delete chat</span>
          </button>
        </div>
      </div>
    </motion.div>
    </AnimatePresence>
  );
};

export default UserInfoPopup;