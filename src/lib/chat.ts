export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ApiChatMessage = Pick<ChatMessage, "role" | "content">;

export type ChatApiResponse = {
  response: string;
  mode?: "production" | "test";
  error?: string;
};

export const CHAT_STORAGE_KEY = "master_ai_messages_v2";

export const STARTER_PROMPTS = [
  "Create a practical plan for my idea",
  "Write a clean WhatsApp reply",
  "Explain this in simple Hinglish",
  "Turn this into website copy",
] as const;

export function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${crypto.randomUUID()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function toApiMessages(messages: ChatMessage[]): ApiChatMessage[] {
  return messages.map(({ role, content }) => ({ role, content }));
}

export function parseStoredMessages(value: string | null): ChatMessage[] {
  if (!value) return [];

  const parsed: unknown = JSON.parse(value);

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const record = item as Partial<ChatMessage>;

    if (
      (record.role !== "user" && record.role !== "assistant") ||
      typeof record.content !== "string" ||
      !record.content.trim()
    ) {
      return [];
    }

    return [
      {
        id:
          typeof record.id === "string" && record.id
            ? record.id
            : crypto.randomUUID(),
        role: record.role,
        content: record.content,
        createdAt:
          typeof record.createdAt === "string"
            ? record.createdAt
            : new Date().toISOString(),
      },
    ];
  });
}
