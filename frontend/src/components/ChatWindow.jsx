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
  handleTyping
}) {
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);  // 👈 add with your other state

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

      // Only add it if we're currently chatting with that sender
      if (String(incomingMessage.sender) === String(selectedUser?._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    });

    return () => {
      socket.off("newMessage");   // cleanup when component unmounts or selectedUser changes
    };
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No conversation selected</h3>
          <p className="text-sm text-gray-400">Pick someone from the left to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow">
            {selectedUser.username[0]?.toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 leading-tight">{selectedUser.username}</h3>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 8h10M7 12h6m-6 4h10M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              // ✅ THE FIX: backend stores sender, not senderId
              const isMine = String(msg.sender) === String(currentUserId);
              const prevMsg = messages[index - 1];
              const isFirst = !prevMsg || String(prevMsg.sender) !== String(msg.sender);

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${isFirst ? "mt-4" : "mt-0.5"}`}
                >
                  {/* Avatar for receiver — only on first in a group */}
                  {!isMine && (
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0 ${!isFirst ? "invisible" : ""}`}>
                      {selectedUser.username[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    <div
                      className={`
                        px-4 py-2.5 text-sm leading-relaxed max-w-sm lg:max-w-md shadow-sm
                        ${isMine
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm"
                        }
                      `}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {/* Spacer on receiver side when it's mine */}
                  {isMine && <div className="w-7 flex-shrink-0" />}
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
        {isTyping && (
          <div className="flex items-end gap-2 mt-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
              {selectedUser.username[0]?.toUpperCase()}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-1"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
              ${message.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-blue-200 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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