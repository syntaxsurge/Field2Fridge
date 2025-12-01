import { NextRequest, NextResponse } from "next/server";
import { buildRegisterAgent, buildServiceTokenTransfer } from "@/lib/contracts/tx-builders";
import { ensureContractAllowed, enforceMaxSpend } from "@/lib/guards/spend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

type ActionPayload =
  | { actionType: "transfer"; to: `0x${string}`; amount: string; network: "bscTestnet" | "bscMainnet" }
  | { actionType: "register"; agentId: string; owner: `0x${string}`; network: "bscTestnet" | "bscMainnet" };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ActionPayload & { wallet: `0x${string}`; usdEstimate?: number };

  if (!convexClient) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }

  const user = await convexClient.query(api.functions.users.getUserByWallet, { wallet: body.wallet });
  const prefs = (user?.prefs as
    | {
        allowedContracts?: string[];
        blockedContracts?: string[];
        maxOnchainUsd?: number;
        maxSpend?: number;
      }
    | undefined) ?? {};

  const networkKey: keyof typeof CONTRACT_ADDRESSES = body.network === "bscMainnet" ? "bsc" : "bscTestnet";

  const tx =
    body.actionType === "transfer"
      ? buildServiceTokenTransfer({ network: networkKey, to: body.to, amount: body.amount })
      : buildRegisterAgent({ network: networkKey, agentId: body.agentId, owner: body.owner });

  ensureContractAllowed(tx.to, prefs.allowedContracts, prefs.blockedContracts);
  if (body.usdEstimate) {
    enforceMaxSpend(body.usdEstimate, prefs.maxOnchainUsd ?? prefs.maxSpend);
  }

  const paymentProbe = await fetch(`${process.env.Q402_GATEWAY_URL ?? "http://localhost:4020"}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx }),
  });

  if (paymentProbe.status !== 402) {
    return NextResponse.json({ error: "Gateway did not request payment." }, { status: 500 });
  }

  const paymentRequired = await paymentProbe.json();

  return NextResponse.json({ tx, paymentRequired, prefs });
}
