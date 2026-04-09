import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import socket from "../socket.js";

function Dashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const typingTimeoutRef = useRef(null);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/user/dashboard",
          { withCredentials: true }
        );
        setUsers(res.data.users);
        setCurrentUser(res.data.currentUser); // ✅ THIS WAS MISSING

      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/message/${user._id}`,
        { withCredentials: true }
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/message/send",
        {
          receiverId: selectedUser._id,
          content: message
        },
        { withCredentials: true }
      );

      const newMsg = {
        _id: res.data.data._id,
        content: res.data.data.content,
        sender: res.data.data.sender
      };

      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", { to: selectedUser._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: selectedUser._id });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto my-8 h-[85vh] sm:h-[88vh] lg:h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden flex">
        {/* LEFT SIDEBAR */}
        <div className="w-96 bg-white border-r p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Chats</h2>
            <div className="text-sm text-gray-500">Active</div>
          </div>

          {users.length === 0 && (
            <p className="text-gray-500">No users found</p>
          )}

          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition
                  ${selectedUser?._id === user._id
                    ? "bg-blue-50 ring-1 ring-blue-200"
                    : "hover:bg-gray-50"
                  }`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg">
                  {user.username[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-lg text-gray-800 truncate">{user.username}</p>
                  <p className="text-sm text-gray-500 truncate">Click to chat</p>
                </div>
                <div className="text-sm text-gray-400">›</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div className="flex-1 bg-slate-50">
          {currentUser && (
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              currentUserId={currentUser._id}
              message={message}
              setMessages={setMessages}
              setMessage={setMessage}
              handleSend={handleSend}
              handleTyping={handleTyping}    // 👈 added
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
