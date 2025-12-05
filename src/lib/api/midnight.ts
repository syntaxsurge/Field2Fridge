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
  const res = await fetch("/api/midnight/proof", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await res.json().catch(() => null)) as ProofResult & { error?: string } | null;

  if (!res.ok) {
    throw new Error(payload?.error ?? `Midnight prover error ${res.status}`);
  }

  return {
    proofId: payload!.proofId,
    commitment: payload!.commitment,
    submittedAt: payload!.submittedAt,
  };
}
