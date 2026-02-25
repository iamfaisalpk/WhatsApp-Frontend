import { io } from "socket.io-client";

const baseURL = import.meta.env.VITE_API_URL;

const socket = io(baseURL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

export function connectSocket(token) {
  if (!token) return;

  socket.auth = { token };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
