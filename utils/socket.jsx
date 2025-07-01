// import { io } from "socket.io-client";
// const baseURL = import.meta.env.VITE_API_URL

// const socket = io(`${baseURL}`, {
//     withCredentials: true,
// });

// export default socket;



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

