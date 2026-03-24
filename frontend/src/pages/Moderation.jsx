import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Moderation() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [modMsg, setModMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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

  const sendModeration = async (e) => {
    e.preventDefault();
    if (!modMsg.trim() || !activeConvo) return;
    setSending(true);
    try {
      const res = await client.post(`/messaging/conversations/${activeConvo.id}/`, { content: modMsg });
      setMessages((prev) => [...prev, res.data]);
      setModMsg("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getParticipants = (convo) => {
    return convo.participants_detail || [];
  };

  if (!user || !["moderator", "admin"].includes(user.role)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Access restricted to moderators and administrators.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((sum, c) => sum + (c.last_message ? 1 : 0), 0);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">Moderation</h1>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase">
            {user.role}
          </span>
        </div>
        <p className="text-gray-500">Monitor and moderate all community conversations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
          <p className="text-2xl font-display font-bold text-brand-700">{totalConversations}</p>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Conversations</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm">
          <p className="text-2xl font-display font-bold text-gray-900">{conversations.filter(c => c.last_message?.is_moderation).length}</p>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Moderated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversation list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              No conversations on the platform yet.
            </div>
          ) : conversations.map((convo) => {
            const participants = getParticipants(convo);
            const hasModeration = convo.last_message?.is_moderation;
            return (
              <button key={convo.id} onClick={() => openConversation(convo.id)}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${activeConvo?.id === convo.id ? "border-amber-300 bg-amber-50" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-gray-900">
                    {participants.map(p => `${p.first_name} ${p.last_name}`).join(" & ")}
                  </p>
                  {hasModeration && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">MOD</span>
                  )}
                </div>
                {participants[0]?.district_detail && (
                  <p className="text-[10px] text-gray-400 mb-1">{participants.map(p => p.district_detail?.name).filter(Boolean).join(" / ")}</p>
                )}
                {convo.last_message && (
                  <p className="text-xs text-gray-500 truncate">{convo.last_message.content}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Active conversation */}
        <div className="md:col-span-2">
          {activeConvo ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "600px" }}>
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 bg-amber-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getParticipants(activeConvo).map(p => `${p.first_name} ${p.last_name}`).join(" & ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getParticipants(activeConvo).map(p => p.district_detail?.name).filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    {messages.length} messages
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map((msg) => {
                  const senderDetail = msg.sender_detail;
                  return (
                    <div key={msg.id} className="flex flex-col">
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.is_moderation
                          ? "bg-amber-50 border border-amber-200 text-amber-800 self-center"
                          : "bg-gray-50 text-gray-800"
                      }`}>
                        {msg.is_moderation && <p className="text-[10px] font-bold uppercase mb-1 text-amber-600">Moderator</p>}
                        <p className="text-[10px] font-semibold text-gray-400 mb-0.5">
                          {senderDetail ? `${senderDetail.first_name} ${senderDetail.last_name}` : `User ${msg.sender}`}
                        </p>
                        {msg.content}
                      </div>
                      <p className="text-[9px] text-gray-300 mt-0.5 px-1">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Moderation input */}
              <div className="px-5 py-4 border-t border-amber-100 bg-amber-50/30">
                <p className="text-[10px] font-bold uppercase text-amber-500 mb-2 tracking-wider">Send Moderation Message</p>
                <form onSubmit={sendModeration} className="flex gap-2">
                  <input type="text" value={modMsg} onChange={(e) => setModMsg(e.target.value)} placeholder="Enter moderation message..."
                    className="flex-1 border border-amber-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:bg-white focus:ring-2 focus:ring-amber-300 outline-none transition-all" />
                  <button type="submit" disabled={sending}
                    className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all shadow-sm disabled:opacity-50">
                    {sending ? "Sending..." : "Moderate"}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 text-sm" style={{ height: "600px" }}>
              Select a conversation to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
