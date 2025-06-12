import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import WhatsAppAuth from './assets/Components/WhatsAppAuth/WhatsAppAuth';
import ProtectedRoute from './assets/Components/ProtectedRoute';
import AppMain from './assets/Pages/AppMain';
import Chat from './assets/Pages/Chat';



const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />, 
  },
  {
    path: '/auth',
    element: <WhatsAppAuth />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppMain />,
        children: [
          { path: 'chats/:chatId', element: <Chat /> },
        ],
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;