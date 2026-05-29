"use client";

import ReactMarkdown from "react-markdown";

export default function MessageBubble({
  role,
  content,
}: {
  role: string;
  content: string;
}) {

  const isUser = role === "user";

  return (

    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`max-w-[90%] md:max-w-[75%] rounded-3xl px-5 py-4 text-sm leading-7 ${
          isUser
            ? "bg-white text-black"
            : "bg-[#1f1f1f] text-white"
        }`}
      >

        <ReactMarkdown>

          {content}

        </ReactMarkdown>

      </div>
    </div>
  );
}