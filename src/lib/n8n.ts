import type { ApiChatMessage } from "./chat";

const PRODUCTION_WEBHOOK_FALLBACK =
  "https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

const TEST_WEBHOOK_FALLBACK =
  "https://shashanksss.app.n8n.cloud/webhook-test/b6587c8f-17e2-45bd-ae8f-280f7f0afa29";

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

type WebhookMode = "production" | "test";

type WebhookResult = {
  ok: boolean;
  status: number;
  body: unknown;
  mode: WebhookMode;
};

export type N8nReply = {
  mode: WebhookMode;
  text: string;
  ok: boolean;
  status: number;
};

export type N8nPayload = {
  sessionId: string;
  messages: ApiChatMessage[];
  userMessage: string;
};

function cleanUrl(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function productionWebhookUrl() {
  return cleanUrl(
    process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK,
    PRODUCTION_WEBHOOK_FALLBACK
  );
}

function testWebhookUrl() {
  return cleanUrl(
    process.env.N8N_TEST_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_N8N_TEST_WEBHOOK,
    TEST_WEBHOOK_FALLBACK
  );
}

function buildWebhookPayload({ sessionId, messages, userMessage }: N8nPayload) {
  return {
    action: "sendMessage",
    chatInput: userMessage,
    message: userMessage,
    sessionId,
    messages,
    metadata: {
      app: "Master.ai",
      source: "nextjs-chat-ui",
      timestamp: new Date().toISOString(),
    },
  };
}

async function parseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function extractWebhookText(value: unknown): string {
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(extractWebhookText).find(Boolean) ?? "";
  }

  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  for (const key of RESPONSE_KEYS) {
    const nestedValue = record[key];

    if (typeof nestedValue === "string" && nestedValue.trim()) {
      return nestedValue;
    }

    const nestedText = extractWebhookText(nestedValue);

    if (nestedText.trim()) return nestedText;
  }

  return "";
}

function isWebhookNotRegistered(result: WebhookResult) {
  const text = extractWebhookText(result.body).toLowerCase();

  return (
    result.status === 404 ||
    text.includes("not registered") ||
    text.includes("webhook is not registered") ||
    text.includes("webhook not registered") ||
    text.includes("webhook could not be found")
  );
}

function setupMessage(mode: WebhookMode) {
  if (mode === "production") {
    return "The n8n production webhook is not active yet. Activate the workflow in n8n, or use the test webhook while the workflow editor is listening.";
  }

  return "The n8n test webhook is not listening yet. Open the workflow in n8n and click 'Listen for test event', or activate the workflow for production.";
}

async function postWebhook(
  url: string,
  payload: Record<string, unknown>,
  mode: WebhookMode
): Promise<WebhookResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    return {
      ok: response.ok,
      status: response.status,
      body: await parseBody(response),
      mode,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendToN8n(payload: N8nPayload): Promise<N8nReply> {
  const webhookPayload = buildWebhookPayload(payload);
  const productionUrl = productionWebhookUrl();
  const testUrl = testWebhookUrl();
  const productionResult = await postWebhook(
    productionUrl,
    webhookPayload,
    "production"
  );

  const finalResult =
    productionResult.ok || productionUrl === testUrl || !isWebhookNotRegistered(productionResult)
      ? productionResult
      : await postWebhook(testUrl, webhookPayload, "test");

  const text = extractWebhookText(finalResult.body);
  const notRegistered = isWebhookNotRegistered(finalResult);

  return {
    mode: finalResult.mode,
    ok: finalResult.ok,
    status: finalResult.status,
    text: finalResult.ok
      ? text || "I received your message, but n8n returned an empty reply."
      : notRegistered
        ? setupMessage(finalResult.mode)
        : text || "The n8n workflow returned an error. Please check the workflow and try again.",
  };
}
