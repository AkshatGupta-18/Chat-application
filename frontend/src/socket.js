import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {  // 👈 your backend port
  withCredentials: true,
  autoConnect: false   // 👈 we'll connect manually after login
});

export default socket;