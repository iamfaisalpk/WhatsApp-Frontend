import React, { useEffect, useState } from "react";
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
import ChatWindow from "./assets/Components/chat/ChatWindow";
import { setAuth } from "./assets/store/slices/authSlice";
import UserProfile from "./assets/Pages/UserProfile";
import useAuthManager from "./hooks/useAuthManager";


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
          { path: "chats/:chatId", element: <ChatWindow /> },
          { path : "profile", element : <UserProfile/>}
        ],
      },
    ],
  },
]);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
  const storedToken = localStorage.getItem("authToken");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const refreshToken = localStorage.getItem("refreshToken");

  dispatch(setAuth({
    token: storedToken || null,
    refreshToken: refreshToken || null,
    user: storedUser,
  }));
}, [dispatch]);


  useEffect(() => {
    console.log("App.jsx: Auth loaded, rendering RouterProvider.");
  }, []);

  useAuthManager();
  return <RouterProvider router={router} />;
};

export default App;
