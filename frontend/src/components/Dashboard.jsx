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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/dashboard`,
          { withCredentials: true }
        );
        setUsers(res.data.users);
        setCurrentUser(res.data.currentUser);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };
    fetchUsers();
  }, []);

  // 1. Add this function inside Dashboard()
  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSidebarOpen(false);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/${user._id}`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/message/send`,
        { receiverId: selectedUser._id, content: message },
        { withCredentials: true }
      );
      const newMsg = {
        _id: res.data.data._id,
        content: res.data.data.content,
        sender: res.data.data.sender,
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

  const avatarPalette = [
    "bg-violet-100 text-violet-700",
    "bg-pink-100 text-pink-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];
  const getAvatarClass = (name) =>
    avatarPalette[(name?.charCodeAt(0) ?? 0) % avatarPalette.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100 flex items-center justify-center p-0 sm:p-4 lg:p-8">

      <div className="w-full sm:max-w-5xl lg:max-w-7xl h-screen sm:h-[88vh] lg:h-[90vh] bg-white sm:rounded-2xl shadow-2xl shadow-indigo-200/40 overflow-hidden flex relative">

        {/* ── MOBILE OVERLAY ── */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className={`
            absolute md:relative top-0 left-0 h-full z-20
            w-72 sm:w-80 flex-shrink-0
            bg-white border-r border-slate-100
            flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          {/* Sidebar Header */}
          <div className="px-5 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Messages
            </h2>
          </div>

          {/* Users list */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm gap-2">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
                </svg>
                No users found
              </div>
            )}

            {users.map((user) => {
              const isActive = selectedUser?._id === user._id;
              return (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150 text-left group
                    ${isActive ? "bg-indigo-50 ring-1 ring-indigo-200" : "hover:bg-slate-50"}`}
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0 ${getAvatarClass(user.username)}`}>
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                      {user.username}
                    </p>
                    <p className={`text-xs truncate mt-0.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`}>
                      Tap to open chat
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer — current user */}
          {currentUser && (
            <div className="px-4 py-4 border-t border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarClass(currentUser.username)}`}>
                  {currentUser.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">{currentUser.username}</p>
                  <p className="text-xs text-slate-400">You</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── RIGHT CHAT AREA ── */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-50 relative">

          {/* Mobile top-bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 md:hidden flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600 flex-shrink-0"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {selectedUser ? (
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${getAvatarClass(selectedUser.username)}`}>
                  {selectedUser.username[0]?.toUpperCase()}
                </div>
                <span className="font-semibold text-slate-800 text-sm truncate">{selectedUser.username}</span>
              </div>
            ) : (
              <span className="font-semibold text-slate-500 text-sm">Select a chat</span>
            )}
          </div>

          {/* Empty state */}
          {!selectedUser && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 4v-4z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700 text-base">No conversation open</p>
                <p className="text-sm text-slate-400 mt-1">Pick someone from the list to start chatting</p>
              </div>
            </div>
          )}

          {/* Chat Window */}
          {currentUser && selectedUser && (
            <ChatWindow
              selectedUser={selectedUser}
              messages={messages}
              currentUserId={currentUser._id}
              message={message}
              setMessages={setMessages}
              setMessage={setMessage}
              handleSend={handleSend}
              handleTyping={handleTyping}
              handleBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;