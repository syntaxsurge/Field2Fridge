import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(req: NextRequest) {
  const memId = process.env.MEMBASE_ID;
  const memAccount = process.env.MEMBASE_ACCOUNT;
  const memSecret = process.env.MEMBASE_SECRET_KEY;
  if (!memId || !memAccount || !memSecret) {
    return NextResponse.json(
      { error: "Membase env vars missing. Set MEMBASE_ID, MEMBASE_ACCOUNT, MEMBASE_SECRET_KEY." },
      { status: 500 }
    );
  }
  if (!convex) {
    return NextResponse.json({ error: "Convex client not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const wallet = body?.wallet as string | undefined;
  const snapshot = body?.snapshot;
  if (!wallet || !snapshot) {
    return NextResponse.json({ error: "wallet and snapshot are required" }, { status: 400 });
  }

  const user = (await convex.query(api.functions.users.getUserByWallet, { wallet })) as
    | { _id?: string; prefs?: { telemetry?: boolean } }
    | null;
  if (!user?._id) {
    return NextResponse.json({ error: "User not onboarded" }, { status: 404 });
  }
  if (user.prefs && user.prefs.telemetry === false) {
    return NextResponse.json({ error: "Telemetry is disabled for this wallet" }, { status: 403 });
  }

  const inserted = await convex.mutation(api.functions.memory.recordMemory, {
    userId: user._id as Id<"users">,
    snapshot,
    source: "membase",
  });

  const timestamp = Date.now();
  const signature = createHmac("sha256", memSecret).update(JSON.stringify(snapshot) + timestamp).digest("hex");

  return NextResponse.json({
    ok: true,
    memoryId: inserted,
    membase: { id: memId, account: memAccount, signature, timestamp },
  });
}
