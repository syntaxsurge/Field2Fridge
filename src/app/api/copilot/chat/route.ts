import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BASE = "https://api.chaingpt.org";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CHAINGPT_API_KEY;
  const baseUrl = process.env.CHAINGPT_BASE_URL ?? DEFAULT_BASE;
  if (!apiKey) {
    return NextResponse.json({ error: "CHAINGPT_API_KEY is not configured." }, { status: 500 });
  }

  const { question, context } = (await req.json()) as {
    question?: string;
    context?: Record<string, unknown>;
  };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "general_assistant",
      question,
      chatHistory: "off",
      useCustomContext: true,
      contextInjection: {
        companyName: "Field2Fridge",
        companyDescription: "BNB-chain autonomous food supply agents",
        ...context,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `ChainGPT error ${res.status}: ${text}` }, { status: 502 });
  }

  const data = (await res.json()) as { data?: { bot?: string } };
  return NextResponse.json({ answer: data.data?.bot ?? "" });
}
