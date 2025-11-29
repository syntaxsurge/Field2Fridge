const BASE_URL = process.env.CHAINGPT_BASE_URL || "https://api.chaingpt.org";
const API_KEY = process.env.CHAINGPT_API_KEY;

type ChainGptAuditResponse = {
  status: string;
  result?: string;
  error?: string;
};

type ChainGptExplainResponse = {
  status: string;
  answer?: string;
  error?: string;
};

async function chaingptFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!API_KEY) {
    throw new Error("Missing CHAINGPT_API_KEY");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ChainGPT error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function auditContract(source: string) {
  return chaingptFetch<ChainGptAuditResponse>("/audit/contract", { source });
}

export async function explainProtocol(query: string, network = "bsc-testnet") {
  return chaingptFetch<ChainGptExplainResponse>("/web3/explain", { query, network });
}
