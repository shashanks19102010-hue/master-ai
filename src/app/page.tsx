"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TypingLoader from "../components/TypingLoader";
import {
  CHAT_STORAGE_KEY,
  STARTER_PROMPTS,
  type ChatApiResponse,
  type ChatMessage,
  createMessage,
  parseStoredMessages,
  toApiMessages,
} from "../lib/chat";
import { getSessionId } from "../lib/session";

function loadMessages() {
  try {
    return parseStoredMessages(localStorage.getItem(CHAT_STORAGE_KEY));
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    return [];
  }
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<ChatApiResponse["mode"]>();
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    setMessages(loadMessages());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [loaded, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [loading, messages]);

  const statusLabel = useMemo(() => {
    if (!workflowMode) return "Ready";

    return workflowMode === "production" ? "Production webhook" : "Test webhook";
  }, [workflowMode]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setWorkflowMode(undefined);
  }, []);

  const clearSavedChat = useCallback(() => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    resetChat();
  }, [resetChat]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText || loading) return;

      const nextMessages = [...messages, createMessage("user", trimmedText)];

      setMessages(nextMessages);
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            messages: toApiMessages(nextMessages),
          }),
        });
        const data = (await response.json()) as ChatApiResponse;

        if (data.mode) setWorkflowMode(data.mode);

        setMessages([
          ...nextMessages,
          createMessage(
            "assistant",
            data.response ||
              "I received an empty response from n8n. Please check the workflow response node."
          ),
        ]);
      } catch {
        setMessages([
          ...nextMessages,
          createMessage(
            "assistant",
            "Sorry, I could not contact the n8n workflow. Please try again."
          ),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  return (
    <div className="flex h-dvh min-h-dvh overflow-hidden bg-[#212121] text-white">
      <Sidebar
        hasMessages={hasMessages}
        onClearChat={clearSavedChat}
        onNewChat={resetChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onNewChat={resetChat} statusLabel={statusLabel} />

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <section className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 md:px-8">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
              {!hasMessages ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-24 text-center">
                  <img
                    src="/logo.png"
                    alt="Master.ai logo"
                    className="h-20 w-20 rounded-[28px] object-cover shadow-2xl shadow-black/30"
                  />

                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      How can I help you today?
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#b4b4b4] sm:text-base">
                      Master.ai is connected to your n8n workflow, supports long
                      replies, and stays responsive on mobile, laptop, and PC.
                    </p>
                  </div>

                  <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        disabled={loading}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-[#ececec] transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pb-6 pt-2">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {loading && <TypingLoader />}
                </div>
              )}

              {!hasMessages && loading && <TypingLoader />}
              <div ref={bottomRef} />
            </div>
          </section>

          {workflowMode && (
            <p className="mx-auto w-full max-w-3xl px-3 pb-2 text-center text-[11px] text-[#9b9b9b] sm:px-4">
              Reply served by n8n {workflowMode} webhook.
            </p>
          )}

          <ChatInput loading={loading} onSend={sendMessage} />
        </main>
      </div>
    </div>
  );
}
