"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  onSend,
  loading,
}: {
  onSend: (message: string) => void;
  loading: boolean;
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [message]);

  function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) return;

    onSend(trimmedMessage);
    setMessage("");
  }

  return (
    <footer className="shrink-0 px-3 pb-3 sm:px-4 sm:pb-5 md:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] border border-white/10 bg-[#303030] p-2 shadow-2xl shadow-black/20 transition focus-within:border-white/25">
          <div className="flex min-w-0 items-end gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              disabled={loading}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message Master.ai"
              className="max-h-44 min-h-12 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-3 text-[16px] leading-6 text-white outline-none placeholder:text-[#b4b4b4] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !message.trim()}
              aria-label="Send message"
              className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#212121] transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-[#676767] disabled:text-[#2f2f2f] disabled:hover:scale-100"
            >
              <span className="text-lg font-bold leading-none">↑</span>
            </button>
          </div>
        </div>

        <p className="px-2 pt-2 text-center text-[11px] leading-4 text-[#9b9b9b] sm:text-xs">
          Master.ai can make mistakes. Verify important information before use.
        </p>
      </div>
    </footer>
  );
}
