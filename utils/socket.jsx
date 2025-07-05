import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("authToken");

const socket = io(baseURL, {
  auth: {
    token, 
  },
  withCredentials: true,
  autoConnect: false,
});

export default socket;

