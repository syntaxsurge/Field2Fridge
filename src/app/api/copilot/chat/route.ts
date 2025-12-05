import { NextRequest, NextResponse } from "next/server";
import { callChainGptChat } from "@/lib/api/chaingpt";

export async function POST(req: NextRequest) {
  const { question, context } = (await req.json()) as {
    question?: string;
    context?: Record<string, unknown>;
  };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  try {
    const { res, raw, parsed } = await callChainGptChat({
      model: "general_assistant",
      question,
      chatHistory: "off",
      useCustomContext: true,
      contextInjection: {
        companyName: "Field2Fridge",
        companyDescription: "BNB-chain autonomous food supply agents",
        ...context,
      },
    });

    const json = parsed.json;
    if (!res.ok) {
      const message = json?.message ?? parsed.text ?? `ChainGPT error ${res.status}`;
      console.error("ChainGPT chat error payload:", raw);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    if (json && json.status === false) {
      const message = json.message ?? "ChainGPT request failed";
      console.error("ChainGPT chat returned status=false:", raw);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const answer = json?.data?.bot ?? parsed.text ?? "";
    if (!answer) {
      console.error("ChainGPT chat empty response:", raw);
      return NextResponse.json({ error: "ChainGPT returned an empty response" }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("ChainGPT chat call failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
