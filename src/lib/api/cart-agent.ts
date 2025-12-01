export async function recordAgentWebhook(input: {
  wallet: string;
  items: string[];
  totalUsd: number;
  decision: "approved" | "declined" | "fulfilled";
}) {
  const res = await fetch("/api/agents/cart-decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    // Swallow errors but surface in console for debugging.
    const text = await res.text();
    console.warn("Agent webhook failed", res.status, text);
  }
}
