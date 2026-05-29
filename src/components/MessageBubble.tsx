"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import type { ChatMessage } from "../lib/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={`group flex min-w-0 flex-col gap-1 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`message-content min-w-0 max-w-[88%] overflow-hidden rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] sm:px-5 ${
          isUser
            ? "bg-[#303030] text-white"
            : "bg-transparent text-[#ececec] sm:max-w-full"
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>

      <button
        type="button"
        onClick={copyMessage}
        className={`rounded-lg px-2 py-1 text-xs text-[#9b9b9b] opacity-100 transition hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 ${
          isUser ? "mr-2" : "ml-2"
        }`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </article>
  );
}
