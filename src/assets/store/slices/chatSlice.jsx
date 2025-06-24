import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../Services/axiosInstance';

export const accessChat = createAsyncThunk(
    'chat/accessChat',
    async (userId, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/chat', { userId });
        return data.chat;
    } catch (err) {
        return rejectWithValue(err.response.data.message);
    }
}
);

export const fetchChats = createAsyncThunk(
    'chat/fetchChats',
    async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/api/chat');
        return data.chats;
    } catch (err) {
        return rejectWithValue(err.response.data.message);
    }
}
);

// Create group chat
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async (formData, { rejectWithValue }) => {
    try {
    const { data } = await axios.post('/api/chat/group', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.group;
} catch (err) {
    return rejectWithValue(err.response?.data?.message);
}
});

// Rename group
export const renameGroup = createAsyncThunk('chat/renameGroup', async ({ chatId, groupName }, { rejectWithValue }) => {
try {
    const { data } = await axios.put('/api/chat/rename', { chatId, groupName });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message);
}
});


// Add user to group
export const addToGroup = createAsyncThunk('chat/addToGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-add', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message);
}
});

// Remove user from group
export const removeFromGroup = createAsyncThunk('chat/removeFromGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-remove', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message);
}
});

// Leave group
export const leaveGroup = createAsyncThunk('chat/leaveGroup', async (chatId, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-leave', { chatId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message);
}
});

// Delete Chat
export const deleteChat = createAsyncThunk(
    'chat/deleteChat',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.delete(`/api/chat/${chatId}`);
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
}
);


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
    chats: [],
    selectedChat: null,
    loading: false,
    error: null,
},
reducers: {
    setSelectedChat: (state, action) => {
        state.selectedChat = action.payload;
    },
    clearChatError: (state) => {
        state.error = null;
    },
},
extraReducers: (builder) => {
    builder
    .addCase(accessChat.pending, (state) => {
        state.loading = true;
    })
    .addCase(accessChat.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.chats.find(c => c._id === action.payload._id);
        if (!exists) state.chats.unshift(action.payload);
        state.selectedChat = action.payload;
    })
    .addCase(accessChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    .addCase(fetchChats.pending, (state) => {
        state.loading = true;
    })
    .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
    })
    .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    .addCase(createGroupChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
    })

    .addCase(renameGroup.fulfilled, (state, action) => {
        const index = state.chats.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.chats[index] = action.payload;
    })

    .addCase(addToGroup.fulfilled, (state, action) => {
        const index = state.chats.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.chats[index] = action.payload;
    })

    .addCase(removeFromGroup.fulfilled, (state, action) => {
        const index = state.chats.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.chats[index] = action.payload;
    })

    .addCase(leaveGroup.fulfilled, (state, action) => {
        state.chats = state.chats.filter(c => c._id !== action.payload._id);
        if (state.selectedChat?._id === action.payload._id) {
            state.selectedChat = null;
        }
    })

    .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(c => c._id !== action.payload);
    });

},
});

export const { setSelectedChat, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
