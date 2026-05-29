const DEFAULT_N8N_WEBHOOK =
  "https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const DEFAULT_N8N_TEST_WEBHOOK =
  "https://shashanksss.app.n8n.cloud/webhook-test/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  process.env.NEXT_PUBLIC_N8N_WEBHOOK ||
  DEFAULT_N8N_WEBHOOK;

const N8N_TEST_WEBHOOK_URL =
  process.env.N8N_TEST_WEBHOOK_URL ||
  process.env.NEXT_PUBLIC_N8N_TEST_WEBHOOK ||
  DEFAULT_N8N_TEST_WEBHOOK;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type WebhookResult = {
  ok: boolean;
  status: number;
  data: unknown;
  url: string;
  mode: "production" | "test";
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
      "data",
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

function isNotRegisteredResponse(data: unknown, status: number) {
  const responseText = extractResponse(data).toLowerCase();

  return (
    status === 404 &&
    (responseText.includes("not registered") ||
      responseText.includes("webhook") ||
      responseText.includes("not found"))
  );
}

async function postToWebhook(
  url: string,
  payload: Record<string, unknown>,
  mode: "production" | "test"
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

    const contentType = webhookResponse.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await webhookResponse.json()
      : await webhookResponse.text();

    return {
      ok: webhookResponse.ok,
      status: webhookResponse.status,
      data,
      url,
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
    const messages = (body.messages ?? []) as ChatMessage[];
    const sessionId = String(body.sessionId ?? "default-session");
    const lastMessage = messages.at(-1)?.content ?? "";

    if (!lastMessage.trim()) {
      return Response.json(
        { response: "Please type a message before sending." },
        { status: 400 }
      );
    }

    const payload = {
      action: "sendMessage",
      chatInput: lastMessage,
      message: lastMessage,
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

    if (!webhookResult.ok) {
      const notRegistered = isNotRegisteredResponse(
        webhookResult.data,
        webhookResult.status
      );

      return Response.json(
        {
          mode: webhookResult.mode,
          response:
            response ||
            (notRegistered
              ? "The n8n webhook is not registered yet. Activate the workflow for the production URL, or open the workflow editor and click 'Listen for test event' before using the test URL."
              : "The n8n workflow returned an error. Please check the workflow and try again."),
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
