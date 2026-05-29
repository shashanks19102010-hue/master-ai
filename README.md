# Master.ai

A responsive ChatGPT-style AI chat interface powered by Next.js and an n8n workflow webhook.

## Features

- Mobile, laptop, and desktop friendly chat layout
- n8n production webhook with automatic test-webhook fallback
- Session ID memory for workflow conversations
- Local browser chat history
- Starter prompt cards
- Markdown rendering for AI replies
- Copy-to-clipboard on every message
- Auto-growing message input
- Master.ai logo in the app and browser metadata

## Webhook URLs

The app uses these defaults and also supports environment overrides:

```env
N8N_WEBHOOK_URL=https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29
N8N_TEST_WEBHOOK_URL=https://shashanksss.app.n8n.cloud/webhook-test/b6587c8f-17e2-45bd-ae8f-280f7f0afa29
NEXT_PUBLIC_N8N_WEBHOOK=https://shashanksss.app.n8n.cloud/webhook/b6587c8f-17e2-45bd-ae8f-280f7f0afa29
NEXT_PUBLIC_N8N_TEST_WEBHOOK=https://shashanksss.app.n8n.cloud/webhook-test/b6587c8f-17e2-45bd-ae8f-280f7f0afa29
```

If n8n says the production webhook is not registered, activate the workflow in n8n. For the test webhook, open the workflow editor and click **Listen for test event** before sending a message.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```

## Project structure

```text
src/app/             Next.js app routes and global styles
src/app/api/chat/    Chat API proxy to n8n
src/components/      UI components
src/lib/             Shared chat, session, and n8n helpers
public/logo.png      Master.ai logo
```
