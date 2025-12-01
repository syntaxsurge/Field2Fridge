import { NextRequest, NextResponse } from "next/server";
import { hexToSignature, verifyMessage } from "viem";

const REQUIRED_PRICE_USD = 0.5;
const REQUIRED_TOKEN = "F2FS";

export async function POST(req: NextRequest) {
  const paymentHeader = req.headers.get("x-payment");
  if (!paymentHeader) {
    return NextResponse.json(
      {
        error: "Payment required",
        priceUsd: REQUIRED_PRICE_USD,
        token: REQUIRED_TOKEN,
        receiver: "service:Field2Fridge",
        message: "Sign and include x-payment header to continue.",
      },
      { status: 402 }
    );
  }

  const signer = process.env.Q402_SIGNER_PRIVATE_KEY;
  if (!signer) {
    return NextResponse.json({ error: "Server is missing Q402_SIGNER_PRIVATE_KEY" }, { status: 500 });
  }

  // Expect header as JSON: { signature: string, message: string, address: string }
  let parsed: { signature?: `0x${string}`; message?: string; address?: `0x${string}` };
  try {
    parsed = JSON.parse(paymentHeader);
  } catch {
    return NextResponse.json({ error: "Invalid x-payment header" }, { status: 400 });
  }

  if (!parsed.signature || !parsed.message || !parsed.address) {
    return NextResponse.json({ error: "Incomplete x-payment header" }, { status: 400 });
  }

  try {
    const valid = await verifyMessage({
      address: parsed.address,
      message: parsed.message,
      signature: hexToSignature(parsed.signature),
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  // For now, acceptance is signature-based; production would also check on-chain payment/allowlists.
  return NextResponse.json({ ok: true });
}
