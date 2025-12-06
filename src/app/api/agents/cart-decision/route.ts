import { NextRequest, NextResponse } from "next/server";

/**
 * Forwards cart decisions to an external agent webhook (e.g., uAgent + Membase).
 * Configure AGENT_WEBHOOK_URL to point to your Python agent (default http://localhost:8000/cart/decision).
 */
export async function POST(req: NextRequest) {
  const agentUrl =
    process.env.AGENT_WEBHOOK_URL ??
    process.env.UAGENT_CART_DECISION_URL ??
    "http://127.0.0.1:8001/cart_decision";
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const res = await fetch(agentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const json = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  })();

  if (!res.ok) {
    return NextResponse.json({ error: "Agent webhook failed", details: json }, { status: 502 });
  }

  return NextResponse.json(json);
}
