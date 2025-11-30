import { NextRequest, NextResponse } from "next/server";

type ProofResult = {
  proofId: string;
  commitment: string;
  submittedAt: string;
};

export async function POST(req: NextRequest) {
  const proverUrl = process.env.MIDNIGHT_PROVER_URL;
  if (!proverUrl) {
    return NextResponse.json(
      { error: "Configure MIDNIGHT_PROVER_URL to generate ZK proofs." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const res = await fetch(proverUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Midnight prover error ${res.status}: ${text || "unknown error"}` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as ProofResult;
  return NextResponse.json(data);
}
