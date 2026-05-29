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

const STORAGE_KEY = "master_ai_messages";

const starterPrompts = [
  "Summarize my idea into an action plan",
  "Write a professional WhatsApp reply",
  "Create a landing page content outline",
  "Explain this topic in simple Hinglish",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<"production" | "test" | null>(
    null
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [hydrated, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function handleNewChat() {
    setMessages([]);
    setWorkflowMode(null);
  }

  function handleClearChat() {
    localStorage.removeItem(STORAGE_KEY);
    handleNewChat();
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

      if (data.mode === "production" || data.mode === "test") {
        setWorkflowMode(data.mode);
      }

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
      <Sidebar
        hasMessages={messages.length > 0}
        onClearChat={handleClearChat}
        onNewChat={handleNewChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onNewChat={handleNewChat} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-8">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-5 pb-24 text-center">
                  <img
                    src="/logo.png"
                    alt="Master.ai logo"
                    className="h-20 w-20 rounded-[28px] object-cover shadow-2xl shadow-black/30"
                  />
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      How can I help you today?
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#b4b4b4] sm:text-base">
                      Chat with Master.ai through your n8n workflow. Messages,
                      code, and long replies stay inside the responsive chat UI.
                    </p>
                  </div>

                  <div className="grid w-full max-w-2xl gap-2 pt-3 sm:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-[#ececec] transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                      >
                        {prompt}
                      </button>
                    ))}
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

          {workflowMode && (
            <div className="mx-auto w-full max-w-3xl px-3 pb-2 text-center text-[11px] text-[#9b9b9b] sm:px-4">
              Reply served by n8n {workflowMode} webhook.
            </div>
          )}

          <ChatInput loading={loading} onSend={handleSend} />
        </main>
      </div>
    </div>
  );
}
