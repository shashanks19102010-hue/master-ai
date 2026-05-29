const DEFAULT_N8N_WEBHOOK =
  "https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const DEFAULT_N8N_TEST_WEBHOOK =
  "https://shashanksss.app.n8n.cloud/webhook-test/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL?.trim() ||
  process.env.NEXT_PUBLIC_N8N_WEBHOOK?.trim() ||
  DEFAULT_N8N_WEBHOOK;

const N8N_TEST_WEBHOOK_URL =
  process.env.N8N_TEST_WEBHOOK_URL?.trim() ||
  process.env.NEXT_PUBLIC_N8N_TEST_WEBHOOK?.trim() ||
  DEFAULT_N8N_TEST_WEBHOOK;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type WebhookMode = "production" | "test";

type WebhookResult = {
  ok: boolean;
  status: number;
  data: unknown;
  mode: WebhookMode;
};

const RESPONSE_KEYS = [
  "response",
  "reply",
  "answer",
  "output",
  "text",
  "message",
  "content",
  "result",
  "data",
] as const;

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const role = record.role === "assistant" ? "assistant" : "user";
      const content = typeof record.content === "string" ? record.content : "";

      if (!content.trim()) return null;

      return { role, content } satisfies ChatMessage;
    })
    .filter((message): message is ChatMessage => message !== null);
}

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

    for (const key of RESPONSE_KEYS) {
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

function isNotRegisteredResponse(data: unknown, status: number) {
  const responseText = extractResponse(data).toLowerCase();

  return (
    status === 404 ||
    responseText.includes("not registered") ||
    responseText.includes("webhook is not registered") ||
    responseText.includes("webhook not registered") ||
    responseText.includes("webhook could not be found")
  );
}

function notRegisteredMessage(mode: WebhookMode) {
  return mode === "production"
    ? "The n8n production webhook is not registered yet. Activate the workflow in n8n, or keep the workflow editor open and use the test webhook."
    : "The n8n test webhook is not listening yet. Open the workflow in n8n and click 'Listen for test event', or activate the workflow for production.";
}

async function readWebhookResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
  mode: WebhookMode
): Promise<WebhookResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const webhookResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    return {
      ok: webhookResponse.ok,
      status: webhookResponse.status,
      data: await readWebhookResponse(webhookResponse),
      mode,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendToN8n(payload: Record<string, unknown>) {
  const productionResult = await postToWebhook(
    N8N_WEBHOOK_URL,
    payload,
    "production"
  );

  if (productionResult.ok || N8N_WEBHOOK_URL === N8N_TEST_WEBHOOK_URL) {
    return productionResult;
  }

  if (isNotRegisteredResponse(productionResult.data, productionResult.status)) {
    return postToWebhook(N8N_TEST_WEBHOOK_URL, payload, "test");
  }

  return productionResult;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = normalizeMessages(body.messages);
    const sessionId = String(body.sessionId || "default-session");
    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    if (!lastUserMessage?.trim()) {
      return Response.json(
        { response: "Please type a message before sending." },
        { status: 400 }
      );
    }

    const payload = {
      action: "sendMessage",
      chatInput: lastUserMessage,
      message: lastUserMessage,
      sessionId,
      messages,
      metadata: {
        app: "Master.ai",
        source: "nextjs-chat-ui",
        timestamp: new Date().toISOString(),
      },
    };

    const webhookResult = await sendToN8n(payload);
    const response = extractResponse(webhookResult.data);
    const notRegistered = isNotRegisteredResponse(
      webhookResult.data,
      webhookResult.status
    );

    if (!webhookResult.ok) {
      return Response.json(
        {
          mode: webhookResult.mode,
          response: notRegistered
            ? notRegisteredMessage(webhookResult.mode)
            : response ||
              "The n8n workflow returned an error. Please check the workflow and try again.",
        },
        { status: webhookResult.status }
      );
    }

    return Response.json({
      mode: webhookResult.mode,
      response:
        response ||
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
