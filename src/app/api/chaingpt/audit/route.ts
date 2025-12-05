import { NextRequest, NextResponse } from "next/server";
import { callChainGptChat } from "@/lib/api/chaingpt";

export async function POST(req: NextRequest) {
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

  const targetChain = chainId ?? 97;
  const prompt: string[] = [
    "Run a smart contract security audit. Provide vulnerabilities, risks, and remediation steps.",
    `Network chainId: ${targetChain}`,
  ];

  if (contractAddress) {
    prompt.push(`Contract address: ${contractAddress}`);
  }
  if (source) {
    prompt.push(`Solidity source:\n${source}`);
  }

  try {
    const { res, raw, parsed } = await callChainGptChat({
      model: "smart_contract_auditor",
      question: prompt.join("\n\n"),
      chatHistory: "off",
    });

    const json = parsed.json;
    if (!res.ok) {
      const message = json?.message ?? parsed.text ?? `ChainGPT audit error ${res.status}`;
      console.error("ChainGPT audit error payload:", raw);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    if (json && json.status === false) {
      const message = json.message ?? "ChainGPT audit request failed";
      console.error("ChainGPT audit returned status=false:", raw);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const report = json?.data?.report ?? json?.data?.bot ?? parsed.text ?? "No report returned";
    const risk = json?.data?.risk ?? "unknown";

    return NextResponse.json({ report, risk });
  } catch (err) {
    console.error("ChainGPT audit call failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
