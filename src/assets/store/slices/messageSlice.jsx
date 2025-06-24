import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../Services/axiosInstance';


export const sendMessage = createAsyncThunk(
    'message/sendMessage',
    async ({ conversationId, text, media }, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        if (text) formData.append('text', text);
        if (media) formData.append('media', media);

    const { data } = await axios.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
        return data.message;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
}
);

export const fetchMessages = createAsyncThunk(
    'message/fetchMessages',
    async (conversationId, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/messages/${conversationId}`);
        return data.messages;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
}
);


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

const messageSlice = createSlice({
    name: 'message',
    initialState: {
    messages: [],
    loading: false,
    error: null,
},
reducers: {
    clearMessages: (state) => {
        state.messages = [];
    },
    appendNewMessage: (state, action) => {
    state.messages.push(action.payload);
    },
},
extraReducers: (builder) => {
    builder
    .addCase(sendMessage.pending, (state) => {
        state.loading = true;
    })
    .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
    })
    .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })

    .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
    })
    .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
    })
    .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    });
},
});

export const { clearMessages, appendNewMessage  } = messageSlice.actions;
export default messageSlice.reducer;
