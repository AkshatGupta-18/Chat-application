import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./src/routes/user.routes.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./src/routes/message.routes.js";
import http from "http";
import { Server } from "socket.io";



dotenv.config();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {            // 👈 export so routes can use it later
  cors: {
    origin: "*",
    credentials: true
  }
});

// Track connected users: { userId -> socketId }
export const onlineUsers = new Map();

io.on("connection", (socket) => {

  console.log("Socket connected:", socket.id);

  // Frontend will emit this right after connecting
  socket.on("register", (userId) => {
    onlineUsers.set(String(userId), socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    // Remove user from map on disconnect
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
  socket.on("typing", ({ to }) => {
    const receiverSocketId = onlineUsers.get(String(to));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing");
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = onlineUsers.get(String(to));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping");
    }
  });
});

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // frontend port
  credentials: true
}));
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);


server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
