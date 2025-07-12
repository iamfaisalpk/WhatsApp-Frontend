import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../Services/axiosInstance';

const savedChat = JSON.parse(localStorage.getItem("selectedChat"));

export const accessChat = createAsyncThunk(
    'chat/accessChat',
    async (userId, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/chat', { userId });
        return data.chat;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to access chat');
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
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch chats');
    }
}
);

// Create group chat - FIXED to handle groupAvatar properly
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/api/chat/group', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.group;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create group');
    }
});

// Rename group
export const renameGroup = createAsyncThunk('chat/renameGroup', async ({ chatId, groupName }, { rejectWithValue }) => {
try {
    const { data } = await axios.put('/api/chat/rename', { chatId, groupName });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to rename group');
}
});

// Add user to group
export const addToGroup = createAsyncThunk('chat/addToGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-add', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add user');
}
});

// Remove user from group
export const removeFromGroup = createAsyncThunk('chat/removeFromGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-remove', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove user');
}
});

// Leave group
export const leaveGroup = createAsyncThunk('chat/leaveGroup', async (chatId, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-leave', { chatId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to leave group');
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
        return rejectWithValue(err.response?.data?.message || 'Failed to delete chat');
    }
}
);

export const toggleFavorite = createAsyncThunk(
    'chat/toggleFavorite',
    async (chatId, { rejectWithValue }) => {
    try {
        const { data } = await axios.patch(`/api/chat/meta/${chatId}/favorite`);
        return { chatId, isFavorite: data.isFavorite };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle favorite');
    }
}
);

export const markAsRead = createAsyncThunk(
    'chat/markAsRead',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.post('/api/chat-meta/mark-as-read', { chatId });
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
}
);

export const markAsUnread = createAsyncThunk(
    'chat/markAsUnread',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.post('/api/chat-meta/mark-as-unread', { chatId });
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to mark as unread');
    }
}
);

export const getBlockedUsers = createAsyncThunk(
    "chat/getBlockedUsers",
    async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get("/api/users/blocked/list");
        return data; 
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to get blocked users');
    }
}
);

export const toggleMuteChat = createAsyncThunk(
    'chat/toggleMute',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.patch(`/api/chat/meta/${chatId}/mute`);
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle mute');
    }
}
);

export const toggleArchiveChat = createAsyncThunk(
    'chat/toggleArchive',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.patch(`/api/chat/meta/${chatId}/archive`);
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle archive');
    }
}
);

export const togglePinChat = createAsyncThunk(
    'chat/togglePin',
    async (chatId, { rejectWithValue }) => {
    try {
        await axios.patch(`/api/chat/meta/${chatId}/pin`);
        return chatId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle pin');
    }
}
);

export const updateGroupAvatar = createAsyncThunk(
    'chat/updateGroupAvatar', 
    async ({ chatId, formData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/api/chat/group-avatar/${chatId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.chat || data.updatedChat;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update group avatar');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        blockedUsers: [],
        blockedByMe: [],
        selectedChat: savedChat || null,
        mediaToView: null,
        loading: false,
        error: null,
    },
    reducers: {
        updateSeenByInSelectedChat: (state, action) => {
            const { conversationId, seenBy, messageIds } = action.payload;

            if (state.selectedChat && state.selectedChat._id === conversationId) {
                const seenById = typeof seenBy === "object" ? seenBy._id : seenBy;

                if (state.selectedChat.messages) {
                    state.selectedChat.messages = state.selectedChat.messages.map((msg) => {
                        if (!messageIds.includes(msg._id)) return msg;

                        const seenIds = (msg.seenBy || []).map((u) =>
                            typeof u === "object" ? u._id : u
                        );

                        if (!seenIds.includes(seenById)) {
                            return {
                                ...msg,
                                seenBy: [...(msg.seenBy || []), seenBy],
                            };
                        }
                        return msg;
                    });
                }

                const isAlreadyMember = state.selectedChat.members.some(
                    (u) => (u._id || u) === seenById
                );
                if (!isAlreadyMember) {
                    state.selectedChat.members.push(seenBy);
                }
            }
        },

        setSelectedChat: (state, action) => {
    const chatData = {
    ...action.payload,
    groupAvatar: action.payload.groupAvatar || "/WhatsApp.jpg", 
};

    state.selectedChat = chatData;
    localStorage.setItem("selectedChat", JSON.stringify(chatData));
},


        clearChatError: (state) => {
            state.error = null;
        },

        updateSeenBy: (state, action) => {
            const { conversationId, seenBy } = action.payload;
            const chat = state.chats.find((c) => c._id === conversationId);
            if (chat && !chat.seenBy?.includes(seenBy)) {
                chat.seenBy = [...(chat.seenBy || []), seenBy];
            }
        },

        setMediaToView: (state, action) => {
            state.mediaToView = action.payload;
        },

        // Add new reducer to update chat in real-time
        updateChatInList: (state, action) => {
            const updatedChat = action.payload;
            const index = state.chats.findIndex(c => c._id === updatedChat._id);
            if (index !== -1) {
                state.chats[index] = { ...state.chats[index], ...updatedChat };
            }
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(updateGroupAvatar.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateGroupAvatar.fulfilled, (state, action) => {
            state.loading = false;
            const updatedChat = {
                ...action.payload,
                // Ensure group avatar is properly mapped
                groupPic: action.payload.groupAvatar || action.payload.groupPic,
                groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
            };

            // Update in chats array
            const index = state.chats.findIndex(c => c._id === updatedChat._id);
            if (index !== -1) {
                state.chats[index] = updatedChat;
            }

            // Update selectedChat if it's the updated group
            if (state.selectedChat && state.selectedChat._id === updatedChat._id) {
                state.selectedChat = updatedChat;
                localStorage.setItem("selectedChat", JSON.stringify(updatedChat));
            }
        })
        .addCase(updateGroupAvatar.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

            .addCase(accessChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(accessChat.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.chats.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.chats[index] = action.payload; 
                } else {
                    state.chats.unshift(action.payload); 
                }
                state.selectedChat = action.payload;
                localStorage.setItem("selectedChat", JSON.stringify(action.payload));
            })
            .addCase(accessChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchChats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChats.fulfilled, (state, action) => {
                state.loading = false;
                // Map the chats to ensure proper field mapping
                state.chats = action.payload.map(chat => ({
                    ...chat,
                    // Handle different field names for group avatar
                    groupPic: chat.groupAvatar || chat.groupPic || chat.groupProfilePic,
                    // Ensure backward compatibility
                    groupAvatar: chat.groupAvatar || chat.groupPic || chat.groupProfilePic,
                }));
            })
            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // FIXED: Create Group Chat with proper avatar handling
            .addCase(createGroupChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroupChat.fulfilled, (state, action) => {
                state.loading = false;
                const newGroup = {
                    ...action.payload,
                    // Ensure group avatar is properly mapped
                    groupPic: action.payload.groupAvatar || action.payload.groupPic,
                    groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
                };
                state.chats.unshift(newGroup);
                // Also update selectedChat if it's the newly created group
                if (state.selectedChat && state.selectedChat._id === newGroup._id) {
                    state.selectedChat = newGroup;
                    localStorage.setItem("selectedChat", JSON.stringify(newGroup));
                }
            })
            .addCase(createGroupChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(renameGroup.fulfilled, (state, action) => {
                const updatedChat = {
                    ...action.payload,
                    groupPic: action.payload.groupAvatar || action.payload.groupPic,
                    groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
                };
                const index = state.chats.findIndex(c => c._id === updatedChat._id);
                if (index !== -1) {
                    state.chats[index] = updatedChat;
                }
                // Update selectedChat if it's the renamed group
                if (state.selectedChat && state.selectedChat._id === updatedChat._id) {
                    state.selectedChat = updatedChat;
                    localStorage.setItem("selectedChat", JSON.stringify(updatedChat));
                }
            })

            .addCase(addToGroup.fulfilled, (state, action) => {
                const updatedChat = {
                    ...action.payload,
                    groupPic: action.payload.groupAvatar || action.payload.groupPic,
                    groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
                };
                const index = state.chats.findIndex(c => c._id === updatedChat._id);
                if (index !== -1) {
                    state.chats[index] = updatedChat;
                }
                if (state.selectedChat && state.selectedChat._id === updatedChat._id) {
                    state.selectedChat = updatedChat;
                    localStorage.setItem("selectedChat", JSON.stringify(updatedChat));
                }
            })

            .addCase(removeFromGroup.fulfilled, (state, action) => {
                const updatedChat = {
                    ...action.payload,
                    groupPic: action.payload.groupAvatar || action.payload.groupPic,
                    groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
                };
                const index = state.chats.findIndex(c => c._id === updatedChat._id);
                if (index !== -1) {
                    state.chats[index] = updatedChat;
                }
                if (state.selectedChat && state.selectedChat._id === updatedChat._id) {
                    state.selectedChat = updatedChat;
                    localStorage.setItem("selectedChat", JSON.stringify(updatedChat));
                }
            })

            .addCase(leaveGroup.fulfilled, (state, action) => {
                const leftGroupId = action.payload._id;
                state.chats = state.chats.filter(c => c._id !== leftGroupId);
                if (state.selectedChat?._id === leftGroupId) {
                    state.selectedChat = null;
                    localStorage.removeItem("selectedChat");
                }
            })

            .addCase(deleteChat.fulfilled, (state, action) => {
                const deletedChatId = action.payload;
                state.chats = state.chats.filter(c => c._id !== deletedChatId);
                
                if (state.selectedChat?._id === deletedChatId) {
                    state.selectedChat = null;
                    localStorage.removeItem("selectedChat");
                }
            })
            
            .addCase(toggleFavorite.fulfilled, (state, action) => {
                const { chatId, isFavorite } = action.payload;
                
                const chat = state.chats.find(c => c._id === chatId);
                if (chat) {
                    chat.isFavorite = isFavorite !== undefined ? isFavorite : !chat.isFavorite;
                }
                
                if (state.selectedChat && state.selectedChat._id === chatId) {
                    state.selectedChat.isFavorite = isFavorite !== undefined ? isFavorite : !state.selectedChat.isFavorite;
                    localStorage.setItem("selectedChat", JSON.stringify(state.selectedChat));
                }
            })

            // Error handling
            .addCase(deleteChat.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(toggleFavorite.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(renameGroup.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(addToGroup.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(removeFromGroup.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(leaveGroup.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(markAsRead.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.isRead = true;
                }
            })

            .addCase(getBlockedUsers.fulfilled, (state, action) => {
                state.blockedUsers = action.payload.blockedMe || [];
                state.blockedByMe = action.payload.iBlocked || [];
            })

            .addCase(markAsUnread.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.isRead = false;
                }
            })

            .addCase(toggleMuteChat.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.muted = !chat.muted;
                }
            })

            .addCase(toggleArchiveChat.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.archived = !chat.archived;
                }
            })

            .addCase(togglePinChat.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.pinned = !chat.pinned;
                }
            });
        
    },
});

export const { 
    setSelectedChat, 
    clearChatError, 
    updateSeenBy, 
    setMediaToView, 
    updateSeenByInSelectedChat,
    updateChatInList 
} = chatSlice.actions;

export default chatSlice.reducer;