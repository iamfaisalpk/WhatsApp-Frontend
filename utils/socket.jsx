import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL;

const socket = io(baseURL, {
  withCredentials: true,
  autoConnect: false, 
});

export function connectSocket(token) {
  if (!token) return;

  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
}

export default socket;
