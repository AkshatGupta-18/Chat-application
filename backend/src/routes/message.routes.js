import express from "express";
import Message from "../models/message.model.js";
import authMiddleware from "../middleware/auth.js";
import { io, onlineUsers } from "../../server.js"; // 👈 import io and onlineUsers map

const router = express.Router();

/**
 * SEND MESSAGE
 */
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message content required"
      });
    }

    const message = new Message({
      sender: req.userId,
      receiver: receiverId,
      content: content.trim()
    });

    await message.save();

    const receiverSocketId = onlineUsers.get(String(receiverId));
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json({
      success: true,
      message: "Message saved",
      data: message
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// GET /api/message/:receiverId
router.get("/:receiverId", authMiddleware, async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.userId; // ✅ correctly named

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },   // ✅ use actual field names from your schema
        { sender: receiverId, receiver: senderId }    // ✅ same here
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


export default router;
