import React, { useState } from "react";
import {
  X,
  MessageSquare,
  Star,
  Bell,
  MessageCircle,
  Shield,
  Lock,
  Trash2,
  UserMinus,
  Search,
  Crown,
  Phone,
  Video,
  Edit3,
  Camera,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const GroupInfoPopup = ({ chat, onClose, show = true }) => {
  const { user: currentUser } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("members");

  if (!chat || !show) return null;

  const isGroupAdmin = chat.groupAdmin === currentUser._id;
  const memberCount = chat.members ? chat.members.length : 0;

  const menuItems = [
    { icon: MessageSquare, label: "Media, links and docs", count: 0 },
    { icon: Star, label: "Starred messages" },
    { icon: Bell, label: "Mute notifications", toggle: true },
    { icon: MessageSquare, label: "Disappearing messages", status: "Off" },
    { icon: Shield, label: "Group privacy" },
    {
      icon: Lock,
      label: "Encryption",
      subtitle: "Messages are end-to-end encrypted.",
    },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="group-info-popup"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-80 h-full bg-[#161717] text-white shadow-lg border-l border-[#2a3942] fixed top-0 right-0 z-40 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#2a3942]">
            <h2 className="text-lg font-medium">Group info</h2>
            <X
              size={20}
              className="cursor-pointer text-gray-400 hover:text-white transition-colors"
              onClick={onClose}
            />
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto h-[calc(100%-72px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {/* Group Profile */}
            <div className="flex flex-col items-center text-center p-6">
              <div className="relative mb-4">
                <img
                  src={chat.groupAvatar || "/default-avatar.png"}
                  alt={chat.groupName || "Group"}
                  className="w-32 h-32 rounded-full object-cover border-2 border-[#2a3942]"
                />
                {isGroupAdmin && (
                  <div className="absolute bottom-2 right-2 bg-[#00a884] rounded-full p-2 cursor-pointer hover:bg-[#00967a] transition-colors">
                    <Camera size={16} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-semibold">{chat.groupName}</h3>
                {isGroupAdmin && (
                  <Edit3
                    size={16}
                    className="text-[#8696a0] cursor-pointer hover:text-white"
                  />
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Group • {memberCount} members
              </p>
              <p className="text-sm text-gray-400">
                Created by{" "}
                {chat.groupAdmin === currentUser._id
                  ? "You"
                  : chat.groupAdminName || "Admin"}
                , {new Date(chat.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Description */}
            <div className="px-4 py-3 border-b border-[#2a3942]">
              <p className="text-sm text-gray-400 mb-2">Description</p>
              <div className="text-sm text-[#e9edef]">
                {chat.groupDescription || "No description provided."}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b border-[#2a3942]">
              <div className="flex justify-around">
                {[
                  { icon: MessageSquare, label: "Media" },
                  { icon: Phone, label: "Audio" },
                  { icon: Video, label: "Video" },
                  { icon: Search, label: "Search" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center space-y-2 cursor-pointer hover:bg-[#2a3942] p-3 rounded"
                  >
                    <div className="bg-[#00a884] rounded-full p-3">
                      <item.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs text-[#e9edef]">{item.label}</span>
                  </div>
                ))}
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
                        <p className="text-xs text-[#8696a0] mt-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.count !== undefined && (
                      <span className="text-sm text-[#8696a0]">
                        {item.count}
                      </span>
                    )}
                    {item.status && (
                      <span className="text-sm text-[#8696a0]">
                        {item.status}
                      </span>
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

            {/* Members */}
            <div className="px-4 py-3 border-t border-[#2a3942]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">
                  {memberCount} participants
                </p>
                <Search
                  size={16}
                  className="text-[#8696a0] cursor-pointer hover:text-white"
                />
              </div>

              {isGroupAdmin && (
                <div className="flex items-center space-x-3 py-2 hover:bg-[#2a3942] cursor-pointer rounded mb-2">
                  <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#e9edef]">
                      Add participant
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {chat.members?.map((member) => {
                  if (!member) return null; 

                  return (
                    <div
                      key={member._id}
                      className="flex items-center space-x-3 py-2 hover:bg-[#2a3942] cursor-pointer rounded"
                    >
                      <img
                        src={member.profilePic || "/default-avatar.png"}
                        alt={member.name || "User"}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-[#e9edef] truncate">
                            {member._id === currentUser._id
                              ? "You"
                              : member.name}
                          </p>
                          {member._id === chat.groupAdmin && (
                            <Crown size={14} className="text-[#ffd700]" />
                          )}
                        </div>
                        <p className="text-xs text-[#8696a0] truncate">
                          {member.about || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-[#2a3942] space-y-2">
              {isGroupAdmin && (
                <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
                  <Settings size={20} className="text-[#8696a0]" />
                  <span className="text-sm text-[#e9edef]">Group settings</span>
                </button>
              )}
              <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
                <LogOut size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Exit group</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors">
                <MessageCircle size={20} className="text-[#8696a0]" />
                <span className="text-sm text-[#e9edef]">Report group</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-2 py-3 hover:bg-[#2a3942] rounded text-left transition-colors text-red-400">
                <Trash2 size={20} className="text-red-400" />
                <span className="text-sm">Delete group</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GroupInfoPopup;
