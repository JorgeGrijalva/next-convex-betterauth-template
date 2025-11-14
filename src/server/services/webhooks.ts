import { env } from "@/env";

export async function emitWebhook(event: string, payload: any) {
  const url = process.env.N8N_WEBHOOK_URL || (env as any)?.N8N_WEBHOOK_URL;
  const body = JSON.stringify({ event, ...payload });
  if (!url) {
    console.log("Webhook (no URL)", body);
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    return { ok: res.ok };
  } catch (err) {
    console.error("Webhook error", err);
    return { ok: false };
  }
}