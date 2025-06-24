import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.jsx';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice'

export const store = configureStore({
reducer: {
    auth: authReducer,
    chat: chatReducer,
    message: messageReducer
},
});
