import { io } from "socket.io-client";
const baseURL = import.meta.env.VITE_API_URL

const socket = io(`${baseURL}`, {
    withCredentials: true,
});

export default socket;
