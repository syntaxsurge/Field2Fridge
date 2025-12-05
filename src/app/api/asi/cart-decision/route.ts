import { NextRequest, NextResponse } from "next/server";

type Payload = {
  walletAddress?: string;
  vendor?: string;
  totalUsd?: number;
  status?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Payload;
  const { walletAddress, vendor, totalUsd, status } = body;

  if (!walletAddress || !vendor || typeof totalUsd !== "number" || !status) {
    return NextResponse.json({ error: "Missing walletAddress, vendor, totalUsd, or status" }, { status: 400 });
  }

  const target = process.env.UAGENT_CART_DECISION_URL;
  if (!target) {
    console.warn("UAGENT_CART_DECISION_URL is not set; skipping uAgent forwarding");
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: walletAddress,
        vendor,
        total_usd: totalUsd,
        status,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? `uAgent returned ${res.status}`, details: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, uAgent: data });
  } catch (err) {
    console.error("Error forwarding cart decision to uAgent:", err);
    return NextResponse.json({ error: "Failed to contact uAgent" }, { status: 502 });
  }
}
