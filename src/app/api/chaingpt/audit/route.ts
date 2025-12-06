import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BASE = "https://api.chaingpt.org";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CHAINGPT_API_KEY;
  const baseUrl = process.env.CHAINGPT_BASE_URL ?? DEFAULT_BASE;

  if (!apiKey) {
    return NextResponse.json({ error: "CHAINGPT_API_KEY is not configured." }, { status: 500 });
  }

  const { source, contractAddress, chainId } = (await req.json()) as {
    source?: string;
    contractAddress?: string;
    chainId?: number;
  };

  if (!source && !contractAddress) {
    return NextResponse.json(
      { error: "Provide either Solidity source code or a contractAddress to audit." },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    model: "smart_contract_auditor",
  };

  if (source) {
    payload.code = source;
  }

  if (contractAddress) {
    payload.contractAddress = contractAddress;
  }

  if (chainId) {
    payload.chainId = chainId;
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/audit/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `ChainGPT audit error ${res.status}: ${text}` }, { status: 502 });
  }

  const data = (await res.json()) as { data?: { report?: string; risk?: string } };
  return NextResponse.json({
    report: data.data?.report ?? "No report returned",
    risk: data.data?.risk ?? "unknown",
  });
}
