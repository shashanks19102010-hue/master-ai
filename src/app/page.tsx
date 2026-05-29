"use client";

import { useState } from "react";

import Navbar from "@/components/Navbar";

import Sidebar from "@/components/Sidebar";

import ChatInput from "@/components/ChatInput";

import MessageBubble from "@/components/MessageBubble";

import TypingLoader from "@/components/TypingLoader";

import { getSessionId } from "@/lib/session";

export default function Home() {

  const [messages, setMessages] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function sendMessage(
    message: string
  ) {

    if (!message.trim()) return;

    const updatedMessages = [

      ...messages,

      {
        role: "user",
        content: message,
      },
    ];

    setMessages(updatedMessages);

    setLoading(true);

    try {

      const response = await fetch(

        process.env
          .NEXT_PUBLIC_N8N_WEBHOOK!,

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            message,

            sessionId:
              getSessionId(),
          }),
        }
      );

      const data =
        await response.json();

      setMessages([

        ...updatedMessages,

        {
          role: "assistant",

          content:
            data.reply ||
            "No response from AI",
        },
      ]);

    } catch (error) {

      setMessages([

        ...updatedMessages,

        {
          role: "assistant",

          content:
            "Connection error",
        },
      ]);
    }

    setLoading(false);
  }

  return (

    <main className="flex h-screen text-white overflow-hidden">

      <Sidebar />

      <section className="flex-1 flex flex-col">

        <Navbar />

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 space-y-5">

          {messages.length === 0 && (

            <div className="h-full flex flex-col items-center justify-center text-center">

              <img
                src="/ChatGPT Image May 27, 2026, 02_07_57 PM.png"

                alt="logo"

                className="w-24 h-24 rounded-[28px] mb-6"
              />

              <h1 className="text-5xl font-bold mb-4">

                Welcome to Master.ai

              </h1>

              <p className="text-gray-400 max-w-xl leading-7">

                Your modern AI assistant powered by n8n workflows and DeepSeek AI.

              </p>

            </div>
          )}

          {messages.map((msg, index) => (

            <MessageBubble
              key={index}

              role={msg.role}

              content={msg.content}
            />
          ))}

          {loading && (
            <TypingLoader />
          )}

        </div>

        <ChatInput
          onSend={sendMessage}

          loading={loading}
        />

      </section>
    </main>
  );
}