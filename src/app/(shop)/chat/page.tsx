"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Send, Trash2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages();
      }
    } catch {
      // ignore
    }
    setSending(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin bilan chat</h1>
        {messages.length > 0 && (
          <button
            onClick={async () => {
              if (!confirm("Barcha yozishmalarni o'chirishni xohlaysizmi?")) return;
              await fetch("/api/messages", { method: "DELETE" });
              setMessages([]);
            }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={16} /> Tozalash
          </button>
        )}
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p>Hali xabar yo&apos;q</p>
              <p className="text-sm mt-1">Savolingizni yozing, admin javob beradi</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.isAdmin
                    ? "bg-surface text-foreground rounded-tl-sm"
                    : "bg-primary text-white rounded-tr-sm"
                }`}
              >
                {msg.isAdmin && <p className="text-xs font-medium text-accent mb-1">Admin</p>}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.isAdmin ? "text-muted" : "text-white/60"}`}>
                  {(() => {
                    const d = new Date(msg.createdAt);
                    if (isNaN(d.getTime())) return "";
                    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  })()}
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
            placeholder="Xabar yozing..."
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
      </div>
    </div>
  );
}
