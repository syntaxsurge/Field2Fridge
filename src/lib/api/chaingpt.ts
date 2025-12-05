const BASE_URL = (process.env.CHAINGPT_BASE_URL ?? "https://api.chaingpt.org").replace(/\/$/, "");
const API_KEY = process.env.CHAINGPT_API_KEY;

export type ChainGptResponse = {
  status?: boolean;
  message?: string;
  data?: {
    bot?: string;
    report?: string;
    risk?: string;
  };
};

export type ParsedChainGpt = {
  json?: ChainGptResponse;
  text?: string;
};

export function parseChainGptResponse(raw: string): ParsedChainGpt {
  try {
    return { json: JSON.parse(raw) as ChainGptResponse };
  } catch {
    // fall through to attempt SSE-style parsing
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.startsWith("data:")) continue;
    const candidate = line.slice("data:".length).trim();
    if (!candidate) continue;
    try {
      return { json: JSON.parse(candidate) as ChainGptResponse };
    } catch {
      // keep scanning earlier lines
    }
  }

  return { text: raw.trim() };
}

export async function callChainGptChat(payload: Record<string, unknown>) {
  if (!API_KEY) {
    throw new Error("CHAINGPT_API_KEY is not configured");
  }

  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const parsed = parseChainGptResponse(raw);

  return { res, raw, parsed };
}
