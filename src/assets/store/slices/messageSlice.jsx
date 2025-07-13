import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../Services/axiosInstance';

//  Send Message
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (
    { conversationId, text, media, voiceNote, duration, replyTo, forwardFrom, tempId },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      if (text) formData.append('text', text);
      if (media) formData.append('media', media);
      if (voiceNote) formData.append('voiceNote', voiceNote);
      if (duration) formData.append('duration', duration);
      if (replyTo) formData.append('replyTo', replyTo);
      if (forwardFrom) formData.append('forwardFrom', JSON.stringify(forwardFrom));
      if (tempId) formData.append('tempId', tempId);

      const { data } = await axios.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

// 📥 Fetch Messages
export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/messages/${conversationId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

// ✅ Mark As Seen
export const markAsSeen = createAsyncThunk(
  'message/markAsSeen',
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.put('/messages/seen', { conversationId });
      return conversationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as seen');
    }
  }
);

// 🗑 Delete Message (for me or for everyone)
export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async ({ messageId, deleteForEveryone }, { rejectWithValue }) => {
    try {
      if (deleteForEveryone) {
        await axios.delete(`/messages/delete-message/${messageId}`);
      } else {
        await axios.post(`/messages/delete-for-me/${messageId}`);
      }
      return { messageId, deleteForEveryone };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete message');
    }
  }
);

// 🧼 Clear Entire Chat Messages (Optional but often useful)
export const clearChatMessages = createAsyncThunk(
  'message/clearChatMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      await axios.delete(`/messages/clear/${conversationId}`);
      return conversationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to clear chat');
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    appendNewMessage: (state, action) => {
      const msg = action.payload;
      const exists = state.messages.some(
        (m) => m._id === msg._id || (msg.tempId && m.tempId === msg.tempId)
      );
      if (!exists) {
        state.messages.push(msg);
      }
    },
    markMessageDeleted: (state, action) => {
      const messageId = action.payload;
      const index = state.messages.findIndex((m) => m._id === messageId);
      if (index !== -1) {
        state.messages[index].deletedForEveryone = true;
        state.messages[index].text = null;
        state.messages[index].media = null;
        state.messages[index].voiceNote = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const msg = action.payload;
        const exists = state.messages.some(
          (m) => m._id === msg._id || (msg.tempId && m.tempId === msg.tempId)
        );
        if (!exists) {
          state.messages.push(msg);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, deleteForEveryone } = action.payload;
        const index = state.messages.findIndex((m) => m._id === messageId);
        if (index !== -1) {
          if (deleteForEveryone) {
            state.messages[index].deletedForEveryone = true;
            state.messages[index].text = null;
            state.messages[index].media = null;
            state.messages[index].voiceNote = null;
          } else {
            state.messages.splice(index, 1); 
          }
        }
      })

      // Clear Chat
      .addCase(clearChatMessages.fulfilled, (state, action) => {
        state.messages = [];
      });
  },
});

export const { clearMessages, appendNewMessage, markMessageDeleted } = messageSlice.actions;
export default messageSlice.reducer;
