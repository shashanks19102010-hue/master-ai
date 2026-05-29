"use client";

import { useEffect, useRef, useState } from "react";

import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function handleNewChat() {
    setMessages([]);
  }

  async function handleSend(text: string) {
    if (loading) return;

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
        {
          role: "assistant",
          content:
            data.response ||
            "I received an empty response from the workflow. Please try again.",
        },
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
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-[#212121] text-white">
      <Sidebar hasMessages={messages.length > 0} onNewChat={handleNewChat} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onNewChat={handleNewChat} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-8">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-5 pb-24 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-[#212121] shadow-2xl shadow-black/20">
                    M
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      How can I help you today?
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#b4b4b4] sm:text-base">
                      Chat with Master.ai through your n8n workflow. Messages,
                      code, and long replies stay inside the responsive chat UI.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-6 pt-2">
                  {messages.map((msg, index) => (
                    <MessageBubble
                      key={`${msg.role}-${index}`}
                      content={msg.content}
                      role={msg.role}
                    />
                  ))}
                  {loading && <TypingLoader />}
                </div>
              )}
              {messages.length === 0 && loading && <TypingLoader />}
              <div ref={bottomRef} />
            </div>
          </section>

          <ChatInput loading={loading} onSend={handleSend} />
        </main>
      </div>
    </div>
  );
}
