import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [startMsg, setStartMsg] = useState("");
  const messagesEndRef = useRef(null);

  const startRecipientId = searchParams.get("start");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await client.get("/messaging/conversations/");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (id) => {
    try {
      const res = await client.get(`/messaging/conversations/${id}/`);
      setActiveConvo(res.data);
      setMessages(res.data.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvo) return;
    try {
      const res = await client.post(`/messaging/conversations/${activeConvo.id}/`, { content: newMsg });
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  const startNewConversation = async (e) => {
    e.preventDefault();
    if (!startMsg.trim() || !startRecipientId) return;
    try {
      const res = await client.post("/messaging/conversations/", {
        recipient_id: parseInt(startRecipientId),
        message: startMsg,
      });
      setConversations((prev) => [res.data, ...prev]);
      setStartMsg("");
      openConversation(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (convo) => {
    const other = convo.participants_detail?.find((p) => p.id !== user?.id);
    return other || convo.participants_detail?.[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">Messages</h1>
      </div>

      {/* Start new conversation */}
      {startRecipientId && !activeConvo && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <p className="text-sm text-gray-600 mb-3">Start a new conversation:</p>
          <form onSubmit={startNewConversation} className="flex gap-2">
            <input type="text" value={startMsg} onChange={(e) => setStartMsg(e.target.value)} placeholder="Write your message..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all" />
            <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm shadow-brand-200">Send</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              No conversations yet. Visit the Community to connect with others.
            </div>
          ) : conversations.map((convo) => {
            const other = getOtherParticipant(convo);
            return (
              <button key={convo.id} onClick={() => openConversation(convo.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${activeConvo?.id === convo.id ? "border-brand-300 bg-brand-50" : "border-gray-100"}`}>
                <p className="font-semibold text-sm text-gray-900">{other?.first_name} {other?.last_name}</p>
                {convo.last_message && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{convo.last_message.content}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Active conversation */}
        <div className="md:col-span-2">
          {activeConvo ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "500px" }}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100">
                {(() => {
                  const other = getOtherParticipant(activeConvo);
                  return (
                    <div>
                      <p className="font-semibold text-gray-900">{other?.first_name} {other?.last_name}</p>
                      {other?.district_detail && <p className="text-xs text-gray-400">{other.district_detail.name}</p>}
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.is_moderation
                        ? "bg-amber-50 border border-amber-200 text-amber-800"
                        : msg.sender === user?.id
                          ? "bg-brand-600 text-white"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                      {msg.is_moderation && <p className="text-[10px] font-bold uppercase mb-1">Moderator</p>}
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-300 outline-none transition-all" />
                <button type="submit" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all">Send</button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 text-sm" style={{ height: "500px" }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
