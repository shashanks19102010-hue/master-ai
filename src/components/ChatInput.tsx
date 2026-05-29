"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
  loading,
}: {
  onSend: (message: string) => void;

  loading: boolean;
}) {

  const [message, setMessage] =
    useState("");

  function handleSend() {

    if (!message.trim()) return;

    onSend(message);

    setMessage("");
  }

  return (

    <div className="p-4 border-t border-[#2a2a2a] bg-black/20 backdrop-blur-xl">

      <div className="flex items-center bg-[#1a1a1a] rounded-3xl p-2 border border-[#2a2a2a]">

        <textarea
          rows={1}

          value={message}

          disabled={loading}

          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }

          placeholder="Message Master.ai..."

          className="flex-1 resize-none bg-transparent outline-none text-white px-4 py-3"

          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {

              e.preventDefault();

              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}

          className="bg-white text-black rounded-2xl px-5 py-3 font-medium"
        >

          Send

        </button>
      </div>
    </div>
  );
}