import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {  // 👈 your backend port
  withCredentials: true,
  autoConnect: false   // 👈 we'll connect manually after login
});

export default socket;