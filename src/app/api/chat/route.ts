const DEFAULT_N8N_WEBHOOK =
  "https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  process.env.NEXT_PUBLIC_N8N_WEBHOOK ||
  DEFAULT_N8N_WEBHOOK;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function extractResponse(data: unknown): string {
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    const firstResponse = data
      .map(extractResponse)
      .find((value) => value.trim().length > 0);

    return firstResponse ?? "";
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const possibleKeys = [
      "response",
      "reply",
      "answer",
      "output",
      "text",
      "message",
      "content",
      "result",
    ];

    for (const key of possibleKeys) {
      const value = record[key];

      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }

      if (value && typeof value === "object") {
        const nested = extractResponse(value);

        if (nested.trim().length > 0) return nested;
      }
    }
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (body.messages ?? []) as ChatMessage[];
    const sessionId = String(body.sessionId ?? "default-session");
    const lastMessage = messages.at(-1)?.content ?? "";

    if (!lastMessage.trim()) {
      return Response.json(
        { response: "Please type a message before sending." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: lastMessage,
        message: lastMessage,
        sessionId,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = webhookResponse.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await webhookResponse.json()
      : await webhookResponse.text();

    if (!webhookResponse.ok) {
      return Response.json(
        {
          response:
            extractResponse(data) ||
            "The n8n workflow returned an error. Please check the workflow and try again.",
        },
        { status: webhookResponse.status }
      );
    }

    return Response.json({
      response:
        extractResponse(data) ||
        "I received your message, but the workflow did not send back a readable reply.",
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";

    return Response.json(
      {
        response: isTimeout
          ? "The n8n workflow took too long to respond. Please try again."
          : "Sorry, something went wrong while contacting the n8n workflow.",
      },
      { status: 500 }
    );
  }
}
