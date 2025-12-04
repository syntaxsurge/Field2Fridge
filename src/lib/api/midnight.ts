import crypto from "crypto";

const MIDNIGHT_PROVER_URL = process.env.MIDNIGHT_PROVER_URL;

type ProofResult = {
  proofId: string;
  commitment: string;
  submittedAt: string;
};

export async function generateSustainabilityProof(input: {
  farmId: string;
  crop: string;
  threshold: number;
  metrics: Record<string, number>;
}): Promise<ProofResult> {
  // If a prover endpoint exists, call it; otherwise derive a deterministic mock commitment.
  if (MIDNIGHT_PROVER_URL) {
    const res = await fetch(MIDNIGHT_PROVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midnight prover error ${res.status}: ${text}`);
    }
    return (await res.json()) as ProofResult;
  }

  const commitment = crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");

  return {
    proofId: commitment.slice(0, 12),
    commitment,
    submittedAt: new Date().toISOString(),
  };
}
