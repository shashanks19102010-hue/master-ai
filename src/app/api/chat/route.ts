import type { ApiChatMessage } from "../../../lib/chat";
import { sendToN8n } from "../../../lib/n8n";

function normalizeMessages(value: unknown): ApiChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const content = typeof record.content === "string" ? record.content : "";

    if (!content.trim()) return [];

    return [
      {
        role: record.role === "assistant" ? "assistant" : "user",
        content,
      } satisfies ApiChatMessage,
    ];
  });
}

function latestUserMessage(messages: ApiChatMessage[]) {
  return [...messages].reverse().find((message) => message.role === "user");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body.messages);
    const userMessage = latestUserMessage(messages);
    const sessionId = String(body.sessionId || "default-session");

    if (!userMessage?.content.trim()) {
      return Response.json(
        { response: "Please type a message before sending." },
        { status: 400 }
      );
    }

    const reply = await sendToN8n({
      sessionId,
      messages,
      userMessage: userMessage.content,
    });

    return Response.json(
      {
        mode: reply.mode,
        response: reply.text,
      },
      { status: reply.ok ? 200 : reply.status }
    );
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";

    return Response.json(
      {
        response: timedOut
          ? "The n8n workflow took too long to respond. Please try again."
          : "Sorry, something went wrong while contacting the n8n workflow.",
      },
      { status: 500 }
    );
  }
}
