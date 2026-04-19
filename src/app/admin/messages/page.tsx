"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  email: string;
  telegram: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  user?: { name: string };
}

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    fetch("/api/messages")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setConversations)
      .catch(() => {});
  };

  const fetchMessages = (userId: string) => {
    fetch(`/api/messages?userId=${userId}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setMessages)
      .catch(() => {});
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
      const interval = setInterval(() => fetchMessages(selectedUser), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (conv: Conversation) => {
    setSelectedUser(conv.id);
    setSelectedUserName(conv.name);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser || sending) return;

    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim(), userId: selectedUser }),
    });
    if (res.ok) {
      setInput("");
      fetchMessages(selectedUser);
      fetchConversations();
    }
    setSending(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Xabarlar</h1>

      <div className="bg-white rounded-2xl border border-border overflow-hidden flex" style={{ height: "70vh" }}>
        {/* Conversations list */}
        <div className={`w-80 border-r border-border overflow-y-auto shrink-0 ${selectedUser ? "hidden md:block" : ""}`}>
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="mx-auto text-muted-light mb-3" size={36} />
              <p className="text-sm text-muted">Hali xabar yo&apos;q</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-surface/50 transition ${
                    selectedUser === conv.id ? "bg-surface" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{conv.name}</span>
                    {Number(conv.unreadCount) > 0 && (
                      <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{conv.telegram}</p>
                  <p className="text-xs text-muted-light truncate mt-1">{conv.lastMessage}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden text-sm text-accent"
                >
                  ← Orqaga
                </button>
                <h3 className="font-medium">{selectedUserName}</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.isAdmin
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-surface text-foreground rounded-tl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.isAdmin ? "text-white/60" : "text-muted"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="border-t border-border p-4 flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Javob yozing..."
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-light transition disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto text-muted-light mb-3" size={48} />
                <p className="text-muted">Chatni tanlang</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
