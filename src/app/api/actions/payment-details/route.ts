import { NextRequest, NextResponse } from "next/server";
import { buildRegisterAgent, buildServiceTokenTransfer } from "@/lib/contracts/tx-builders";
import { ensureContractAllowed, enforceMaxSpend } from "@/lib/guards/spend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

type Prefs = {
  allowedContracts?: string[];
  blockedContracts?: string[];
  maxOnchainUsd?: number;
  maxSpend?: number;
};

type ActionPayload =
  | { actionType: "transfer"; to: `0x${string}`; amount: string; network: "bscTestnet" | "bscMainnet" }
  | { actionType: "register"; agentId: string; owner: `0x${string}`; network: "bscTestnet" | "bscMainnet" };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ActionPayload & { wallet: `0x${string}`; usdEstimate?: number };

  if (!convexClient) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }

  if (!body.wallet || !body.wallet.startsWith("0x")) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  let prefs: Prefs = {};
  try {
    const user = await convexClient.query(api.functions.users.getUserByWallet, { wallet: body.wallet });
    prefs = (user?.prefs as Prefs) ?? {};
  } catch (err) {
    console.error("payment-details: Convex query failed, using empty prefs", err);
    prefs = {};
  }

  const networkKey: keyof typeof CONTRACT_ADDRESSES = body.network === "bscMainnet" ? "bsc" : "bscTestnet";

  const tx =
    body.actionType === "transfer"
      ? buildServiceTokenTransfer({ network: networkKey, to: body.to, amount: body.amount })
      : buildRegisterAgent({ network: networkKey, agentId: body.agentId, owner: body.owner });

  ensureContractAllowed(tx.to, prefs.allowedContracts, prefs.blockedContracts);
  if (body.usdEstimate) {
    enforceMaxSpend(body.usdEstimate, prefs.maxOnchainUsd ?? prefs.maxSpend);
  }

  const gateway = process.env.Q402_GATEWAY_URL ?? "http://localhost:4020";
  let paymentRequired: unknown;
  try {
    const paymentProbe = await fetch(`${gateway}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx }),
    });

    if (paymentProbe.status !== 402) {
      const errText = await paymentProbe.text();
      return NextResponse.json(
        { error: `Gateway did not return 402: ${paymentProbe.status} ${errText}` },
        { status: 502 }
      );
    }

    paymentRequired = await paymentProbe.json();
  } catch (err) {
    return NextResponse.json({ error: `Gateway unreachable: ${(err as Error).message}` }, { status: 502 });
  }

  return NextResponse.json({ tx, paymentRequired, prefs });
}
