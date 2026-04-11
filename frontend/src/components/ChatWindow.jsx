import { useEffect, useRef, useState } from "react";
import socket from "../socket.js";

function ChatWindow({
  selectedUser,
  currentUserId,
  messages,
  message,
  setMessages,
  setMessage,
  handleSend,
  handleTyping,
  handleBack,
}) {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("newMessage", (incomingMessage) => {
      if (String(incomingMessage.sender) === String(selectedUser?._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    });
    return () => {
      socket.off("newMessage");
    };
  }, [selectedUser]);

  const avatarPalette = [
    "from-violet-400 to-purple-500",
    "from-pink-400 to-rose-500",
    "from-sky-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ];
  const getGradient = (name) =>
    avatarPalette[(name?.charCodeAt(0) ?? 0) % avatarPalette.length];

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 ring-1 ring-indigo-100">
            <svg className="w-9 h-9 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No conversation open</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Select someone from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <button
        onClick={handleBack}
        className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 transition text-slate-500 flex-shrink-0"
        aria-label="Back"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="flex-shrink-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br ${getGradient(selectedUser.username)} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
            {selectedUser.username[0]?.toUpperCase()}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
            {selectedUser.username}
          </h3>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-0.5 bg-gradient-to-b from-slate-50/80 to-white">

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-100">
              <svg className="w-7 h-7 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 8h10M7 12h6m-6 4h10M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-600 text-sm font-medium">Start the conversation</p>
              <p className="text-slate-400 text-xs mt-0.5">Say hi to {selectedUser.username} 👋</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = String(msg.sender) === String(currentUserId);
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];
            const isFirstInGroup = !prevMsg || String(prevMsg.sender) !== String(msg.sender);
            const isLastInGroup = !nextMsg || String(nextMsg.sender) !== String(msg.sender);

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-1.5 sm:gap-2 ${isMine ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
              >
                {/* Receiver avatar */}
                {!isMine && (
                  <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br ${getGradient(selectedUser.username)} text-white text-xs flex items-center justify-center font-semibold ${isLastInGroup ? "opacity-100" : "opacity-0"}`}>
                    {selectedUser.username[0]?.toUpperCase()}
                  </div>
                )}

                {/* Bubble */}
                <div className={`flex flex-col gap-0.5 max-w-[78%] sm:max-w-sm lg:max-w-md ${isMine ? "items-end" : "items-start"}`}>
                  <div
                    className={`
                      px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm leading-relaxed break-words
                      ${isMine
                        ? `bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-200 rounded-2xl ${isLastInGroup ? "rounded-br-sm" : ""}`
                        : `bg-white text-slate-700 border border-slate-100 shadow-sm rounded-2xl ${isLastInGroup ? "rounded-bl-sm" : ""}`
                      }
                    `}
                  >
                    {msg.content}
                  </div>
                </div>

                {isMine && <div className="w-6 sm:w-7 flex-shrink-0" />}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-1.5 sm:gap-2 mt-3">
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-gradient-to-br ${getGradient(selectedUser.username)} text-white text-xs flex items-center justify-center font-semibold flex-shrink-0`}>
              {selectedUser.username[0]?.toUpperCase()}
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="bg-white border-t border-slate-100 px-3 sm:px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 sm:px-4 py-1.5 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input
            type="text"
            placeholder="Type a message…"
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2 min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-150
              ${message.trim()
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}

export default ChatWindow;