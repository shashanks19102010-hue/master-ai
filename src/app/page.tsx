"use client";

import { useState, useRef, useEffect } from "react";

import Navbar from "../components/Navbar";

import Sidebar from "../components/Sidebar";

import ChatInput from "../components/ChatInput";

import MessageBubble from "../components/MessageBubble";

import TypingLoader from "../components/TypingLoader";

import { getSessionId } from "../lib/session";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text: string) {
    const sessionId = getSessionId();
    const userMessage: Message = { role: "user", content: text };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, sessionId }),
      });

      const data = await res.json();
      setMessages([
        ...updated,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-xl font-semibold text-white">
                  Welcome to Master.ai
                </p>
                <p className="text-sm mt-2">
                  Ask me anything to get started.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingLoader />}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={handleSend} loading={loading} />
        </main>
      </div>
    </div>
  );
}
