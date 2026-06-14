const ANALYTICS_TOPIC_PREFIX = "analytics-session";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAnalyticsRealtimeTopic(token: string): Promise<string> {
  const digest = await sha256Hex(token);
  return `${ANALYTICS_TOPIC_PREFIX}:${digest}`;
}
