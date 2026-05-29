"use client";

import ReactMarkdown from "react-markdown";

export default function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant" | string;
  content: string;
}) {
  const isUser = role === "user";

  return (
    <article className={`flex min-w-0 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`message-content min-w-0 max-w-[88%] overflow-hidden rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] sm:px-5 ${
          isUser
            ? "bg-[#303030] text-white"
            : "bg-transparent text-[#ececec] sm:max-w-full"
        }`}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </article>
  );
}
