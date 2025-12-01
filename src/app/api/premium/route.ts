import { NextRequest, NextResponse } from "next/server";
import { buildPaymentHeader } from "@/lib/api/xpayment";

/**
 * Server-side proxy to the local 402 gateway.
 * Clients call this without exposing Q402_SPONSOR_SECRET.
 */
export async function POST(req: NextRequest) {
  const gatewayUrl = process.env.Q402_GATEWAY_URL ?? "http://localhost:4020/api/premium";
  const paymentHeader = buildPaymentHeader();
  const payload = await req.json().catch(() => ({}));

  const res = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-payment": paymentHeader,
    },
    body: JSON.stringify(payload),
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
    return NextResponse.json(
      { error: "Premium action blocked", details: json },
      { status: res.status === 402 ? 402 : 500 }
    );
  }

  return NextResponse.json(json);
}
