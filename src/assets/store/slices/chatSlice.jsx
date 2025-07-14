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
        return {
        activeChats: data.activeChats,
        archivedChats: data.archivedChats
};

    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch chats');
    }
}
);

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

export const renameGroup = createAsyncThunk('chat/renameGroup', async ({ chatId, groupName }, { rejectWithValue }) => {
try {
    const { data } = await axios.put('/api/chat/rename', { chatId, groupName });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to rename group');
}
});

export const addToGroup = createAsyncThunk('chat/addToGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-add', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add user');
}
});

export const removeFromGroup = createAsyncThunk('chat/removeFromGroup', async ({ chatId, userId }, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-remove', { chatId, userId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove user');
}
});

export const leaveGroup = createAsyncThunk('chat/leaveGroup', async (chatId, { rejectWithValue }) => {
    try {
    const { data } = await axios.put('/api/chat/group-leave', { chatId });
    return data.updatedChat;
} catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to leave group');
}
});

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
        archivedChats: [],
        selectedChat: savedChat || null,
        mediaToView: null,
        loading: false,
        error: null,
    },
    reducers: {
messageReceived: (state, action) => {
            const newMessage = action.payload;
            const chatId = newMessage.conversationId || newMessage.chatId;

            if (!chatId) {
            console.warn("Message received without chatId:", newMessage);
            return;
        }
            const currentUserId = newMessage.currentUserId;
            const isMyMessage = newMessage.sender?._id === currentUserId;
            const existingIndex = state.chats.findIndex(chat => chat._id === chatId);
            if (existingIndex !== -1) {
            const existingChat = state.chats[existingIndex];
        
            const updatedChat = {
                ...existingChat,
                lastMessage: newMessage,
                lastMessageTime: newMessage.timestamp || new Date().toISOString(),
                unreadCount: isMyMessage
                ? existingChat.unreadCount || 0
                : state.selectedChat?._id === chatId
                ? 0
                : (existingChat.unreadCount || 0) + 1,
                isRead: isMyMessage
                ? existingChat.isRead
                : state.selectedChat?._id === chatId
                ? true
                : false,
            };
        
            // ✅ Create new array to trigger re-render
            state.chats = [
                updatedChat,
                ...state.chats.filter((_, i) => i !== existingIndex),
            ];
        
            // ✅ Update selected chat if it's open
            if (state.selectedChat?._id === chatId) {
                state.selectedChat = {
                ...state.selectedChat,
                lastMessage: newMessage,
                lastMessageTime: newMessage.timestamp || new Date().toISOString(),
                unreadCount: 0,
                isRead: true,
            };
                localStorage.setItem("selectedChat", JSON.stringify(state.selectedChat));
            }
            } else {
            const newChat = {
                _id: chatId,
                lastMessage: newMessage,
                lastMessageTime: newMessage.timestamp || new Date().toISOString(),
                unreadCount: isMyMessage ? 0 : 1,
                isRead: isMyMessage ? true : false,
                isGroup: newMessage.isGroup || false,
                members: newMessage.members || [],
                groupName: newMessage.groupName || '',
                groupAvatar: newMessage.groupAvatar || '/WhatsApp.jpg',
            };
        
            state.chats = [newChat, ...state.chats];
        }
        },


messageSent: (state, action) => {
    const { chatId, message } = action.payload;
    
    // Find and update the chat
    const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
    
    if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        const updatedChat = {
            ...chat,
            lastMessage: message,
            lastMessageTime: message.timestamp || new Date().toISOString(),
            unreadCount: 0, 
            isRead: true,
        };
        
        // Move to top
        state.chats.splice(chatIndex, 1);
        state.chats.unshift(updatedChat);
        
        // Update selectedChat if it's active
        if (state.selectedChat?._id === chatId) {
            state.selectedChat = {
                ...state.selectedChat,
                lastMessage: message,
                lastMessageTime: message.timestamp || new Date().toISOString(),
            };
            localStorage.setItem("selectedChat", JSON.stringify(state.selectedChat));
        }
    }
},

        updateLastMessage: (state, action) => {
            const { chatId, lastMessage, senderId, currentUserId } = action.payload;
            const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);

            if (chatIndex !== -1) {
                const chat = state.chats[chatIndex];
                const isMyMessage = senderId === currentUserId;
                const isSelectedChat = state.selectedChat?._id === chatId;

                // Update last message
                state.chats[chatIndex].lastMessage = lastMessage;
                state.chats[chatIndex].lastMessageTime = lastMessage.timestamp || new Date().toISOString();

                // Only update unread count if it's not my message and not the selected chat
                if (!isMyMessage && !isSelectedChat) {
                    state.chats[chatIndex].unreadCount = (chat.unreadCount || 0) + 1;
                    state.chats[chatIndex].isRead = false;
                }

                // Move to top of chat list
                const updatedChat = state.chats.splice(chatIndex, 1)[0];
                state.chats.unshift(updatedChat);
            }
        },

        setSelectedChat: (state, action) => {
            const payload = action.payload;

            if (!payload) {
                state.selectedChat = null;
                localStorage.removeItem("selectedChat");
                return;
            }

            const chatData = {
                ...payload,
                groupAvatar: payload.groupAvatar || "/WhatsApp.jpg",
                unreadCount: 0, 
                isRead: true, 
            };

            state.selectedChat = chatData;
            localStorage.setItem("selectedChat", JSON.stringify(chatData));

            // Also update the chat in the chats array
            const chatIndex = state.chats.findIndex(c => c._id === payload._id);
            if (chatIndex !== -1) {
                state.chats[chatIndex].unreadCount = 0;
                state.chats[chatIndex].isRead = true;
            }
        },

        // FIXED: Manual unread count update with proper validation
        updateUnreadCount: (state, action) => {
            const { chatId, senderId, currentUserId } = action.payload;
            const chat = state.chats.find((c) => c._id === chatId);

            // Only increment if it's not the current user's message
            if (chat && senderId !== currentUserId) {
                // Don't increment if chat is currently selected
                if (state.selectedChat?._id !== chatId) {
                    chat.unreadCount = (chat.unreadCount || 0) + 1;
                    chat.isRead = false;
                }
            }
        },

        // FIXED: Seen by handler with proper null checks
        updateSeenByInSelectedChat: (state, action) => {
            const { conversationId, readBy, messageIds } = action.payload;

            if (state.selectedChat && state.selectedChat._id === conversationId) {
                const seenById = typeof readBy === "object" ? readBy._id : readBy;

                if (state.selectedChat.messages) {
                    state.selectedChat.messages = state.selectedChat.messages.map((msg) => {
                        if (!messageIds.includes(msg._id)) return msg;

                        const seenIds = (msg.readBy || []).map((u) =>
                            typeof u === "object" ? u._id : u
                        );

                        if (!seenIds.includes(seenById)) {
                            return {
                                ...msg,
                                readBy: [...(msg.readBy || []), readBy],
                            };
                        }
                        return msg;
                    });
                }

                // Ensure members array exists and has proper null checks
                if (state.selectedChat.members && Array.isArray(state.selectedChat.members)) {
                    const isAlreadyMember = state.selectedChat.members.some(
                        (u) => u && (u._id || u) === seenById
                    );

                    if (!isAlreadyMember) {
                        state.selectedChat.members.push(readBy);
                    }
                }
            }
        },

        // Helper reducer to manually refresh a chat
        refreshChat: (state, action) => {
            const chatId = action.payload;
            const chatIndex = state.chats.findIndex(c => c._id === chatId);
            
            if (chatIndex !== -1) {
                // Force a re-render by creating a new object
                state.chats[chatIndex] = { ...state.chats[chatIndex] };
            }
        },

        clearChatError: (state) => {
            state.error = null;
        },

        updateSeenBy: (state, action) => {
            const { conversationId, readBy } = action.payload;
            const chat = state.chats.find((c) => c._id === conversationId);
            if (chat && !chat.readBy?.includes(readBy)) {
                chat.readBy = [...(chat.readBy || []), readBy];
            }
        },

        setMediaToView: (state, action) => {
            state.mediaToView = action.payload;
        },

        updateChatInList: (state, action) => {
            const updatedChat = action.payload;
            const index = state.chats.findIndex(c => c._id === updatedChat._id);
            if (index !== -1) {
                state.chats[index] = { ...state.chats[index], ...updatedChat };
            } else {
                state.chats.unshift(updatedChat); 
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

            const formatChat = (chat) => ({
            ...chat,
            groupPic: chat.groupAvatar || chat.groupPic || chat.groupProfilePic,
            groupAvatar: chat.groupAvatar || chat.groupPic || chat.groupProfilePic,
            unreadCount: chat.unreadCount || 0,
            isRead: chat.isRead !== undefined ? chat.isRead : true,
            });

            state.chats = action.payload.activeChats.map(formatChat);
            state.archivedChats = action.payload.archivedChats.map(formatChat);
        })

            .addCase(fetchChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createGroupChat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGroupChat.fulfilled, (state, action) => {
                state.loading = false;
                const newGroup = {
                    ...action.payload,
                    groupPic: action.payload.groupAvatar || action.payload.groupPic,
                    groupAvatar: action.payload.groupAvatar || action.payload.groupPic,
                    unreadCount: 0,
                    isRead: true,
                };
                state.chats.unshift(newGroup);
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

            // FIXED: Mark as read properly resets unread count
            .addCase(markAsRead.fulfilled, (state, action) => {
                const chatId = action.payload;
                const chat = state.chats.find(c => c._id === chatId);
        
                if (chat) {
                    chat.isRead = true;
                    chat.unreadCount = 0; 
                }
            
                if (state.selectedChat && state.selectedChat._id === chatId) {
                    state.selectedChat.isRead = true;
                    state.selectedChat.unreadCount = 0;
                    localStorage.setItem("selectedChat", JSON.stringify(state.selectedChat));
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
                    chat.unreadCount = Math.max(1, chat.unreadCount || 0);
                }
            })

            .addCase(toggleMuteChat.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.muted = !chat.muted;
                }
            })

            .addCase(toggleArchiveChat.fulfilled, (state, action) => {
        const chatId = action.payload;

        const archivedIndex = state.archivedChats.findIndex(c => c._id === chatId);
        if (archivedIndex !== -1) {
            const [chat] = state.archivedChats.splice(archivedIndex, 1);
            chat.isArchived = false;
            state.chats.unshift(chat);
        }

        const activeIndex = state.chats.findIndex(c => c._id === chatId);
        if (activeIndex !== -1) {
            const [chat] = state.chats.splice(activeIndex, 1);
            chat.isArchived = true;
            state.archivedChats.unshift(chat);
        }

        if (state.selectedChat && state.selectedChat._id === chatId) {
            state.selectedChat.isArchived = !state.selectedChat.isArchived;
            localStorage.setItem("selectedChat", JSON.stringify(state.selectedChat));
        }
    })  



            .addCase(togglePinChat.fulfilled, (state, action) => {
                const chat = state.chats.find(c => c._id === action.payload);
                if (chat) {
                    chat.isPinned = !chat.isPinned; 
                }
        
                if (state.selectedChat && state.selectedChat._id === action.payload) {
                    state.selectedChat.isPinned = !state.selectedChat.isPinned;
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
            });
    },
});

export const { 
    setSelectedChat, 
    clearChatError, 
    updateSeenBy, 
    setMediaToView, 
    updateSeenByInSelectedChat,
    updateChatInList,
    updateUnreadCount,
    updateLastMessage,
    messageReceived,
    messageSent,
    refreshChat
} = chatSlice.actions;

export default chatSlice.reducer;