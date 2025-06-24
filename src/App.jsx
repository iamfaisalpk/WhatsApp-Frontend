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
  const storedUser = localStorage.getItem("user");

  dispatch(setAuth({
    token: storedToken || null,
    user: storedUser ? JSON.parse(storedUser) : null,
  }));
}, [dispatch]);

  useEffect(() => {
    console.log("App.jsx: Auth loaded, rendering RouterProvider.");
  }, []);
  return <RouterProvider router={router} />;
};

export default App;
