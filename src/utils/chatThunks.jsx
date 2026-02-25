import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/assets/Services/axiosInstance";

export const accessChat = createAsyncThunk(
  "chat/accessChat",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/chat", { userId });
      return data.chat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to access chat",
      );
    }
  },
);

export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/chat");
      return {
        activeChats: data.activeChats,
        archivedChats: data.archivedChats,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch chats",
      );
    }
  },
);

export const createGroupChat = createAsyncThunk(
  "chat/createGroupChat",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post("/api/chat/group", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.group;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create group",
      );
    }
  },
);

export const renameGroup = createAsyncThunk(
  "chat/renameGroup",
  async ({ chatId, groupName }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/chat/rename", {
        chatId,
        groupName,
      });
      return data.updatedChat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to rename group",
      );
    }
  },
);

export const addToGroup = createAsyncThunk(
  "chat/addToGroup",
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/chat/group-add", {
        chatId,
        userId,
      });
      return data.updatedChat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add user",
      );
    }
  },
);

export const removeFromGroup = createAsyncThunk(
  "chat/removeFromGroup",
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/chat/group-remove", {
        chatId,
        userId,
      });
      return data.updatedChat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to remove user",
      );
    }
  },
);

export const leaveGroup = createAsyncThunk(
  "chat/leaveGroup",
  async (chatId, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/chat/group-leave", { chatId });
      return data.updatedChat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to leave group",
      );
    }
  },
);

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/chat/${chatId}`);
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete chat",
      );
    }
  },
);

export const toggleFavorite = createAsyncThunk(
  "chat/toggleFavorite",
  async (chatId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`/api/chat/meta/${chatId}/favorite`);
      return { chatId, isFavorite: data.isFavorite };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle favorite",
      );
    }
  },
);

export const markAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.post("/api/chat-meta/mark-as-read", {
        chatId,
      });
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAsUnread = createAsyncThunk(
  "chat/markAsUnread",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.post("/api/chat-meta/mark-as-unread", { chatId });
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as unread",
      );
    }
  },
);

export const getBlockedUsers = createAsyncThunk(
  "chat/getBlockedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/users/blocked/list");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to get blocked users",
      );
    }
  },
);

export const toggleMuteChat = createAsyncThunk(
  "chat/toggleMute",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.patch(`/api/chat/meta/${chatId}/mute`);
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle mute",
      );
    }
  },
);

export const toggleArchiveChat = createAsyncThunk(
  "chat/toggleArchive",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.patch(`/api/chat/meta/${chatId}/archive`);
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle archive",
      );
    }
  },
);

export const togglePinChat = createAsyncThunk(
  "chat/togglePin",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.patch(`/api/chat/meta/${chatId}/pin`);
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to toggle pin",
      );
    }
  },
);

export const updateGroupAvatar = createAsyncThunk(
  "chat/updateGroupAvatar",
  async ({ chatId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `/api/chat/group-avatar/${chatId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.chat || data.updatedChat;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update group avatar",
      );
    }
  },
);

export const blockUser = createAsyncThunk(
  "chat/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/users/block/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to block user",
      );
    }
  },
);

export const unblockUser = createAsyncThunk(
  "chat/unblockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`/api/users/unblock/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to unblock user",
      );
    }
  },
);

export const clearChat = createAsyncThunk(
  "chat/clearChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/chat/clear/${chatId}`);
      return chatId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to clear chat",
      );
    }
  },
);
