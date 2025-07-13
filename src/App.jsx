import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import WhatsAppAuth from "./assets/Components/WhatsAppAuth/WhatsAppAuth";
import ProtectedRoute from "./assets/Components/ProtectedRoute";
import AppMain from "./assets/Pages/AppMain";
import ProfileSetup from "./assets/Pages/ProfileSetup";
import { setAuth } from "./assets/store/slices/authSlice";
import UserProfile from "./assets/Pages/UserProfile";
import useAuthManager from "./hooks/useAuthManager";
import ChatBox from "./assets/Components/ChatBox/ChatBox";
import socket, { connectSocket } from "../utils/socket";
import { messageReceived } from "./assets/store/slices/chatSlice";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth" replace /> },
  { path: "/auth", element: <WhatsAppAuth /> },
  { path: "/setup-profile", element: <ProfileSetup /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppMain />,
        children: [
          { path: "chats/:chatId", element: <ChatBox /> },
          { path: "profile", element: <UserProfile /> },
        ],
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  // Set auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const refreshToken = localStorage.getItem("refreshToken");

    dispatch(
      setAuth({
        token: storedToken || null,
        refreshToken: refreshToken || null,
        user: storedUser,
      })
    );
  }, [dispatch]);

  // Connect socket when token is available
  useEffect(() => {
    if (token) {
      connectSocket(token);

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      socket.on("message received", (newMessage) => {
        const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

        dispatch(
          messageReceived({
            ...newMessage,
            currentUserId,
          })
        );
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("message received");
      };
    }
  }, [token, dispatch]);

  useAuthManager();

  return <RouterProvider router={router} />;
};

export default App;
