import { NextRequest, NextResponse } from "next/server";
import type { SpaceAgriSimulation, SpaceAgriSimulationRequest } from "@/lib/api/spaceagri";

export async function POST(req: NextRequest) {
  const baseUrl = process.env.SPACEAGRI_BASE_URL;
  const apiKey = process.env.SPACEAGRI_API_KEY;
  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "Configure SPACEAGRI_BASE_URL and SPACEAGRI_API_KEY to run simulations." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as SpaceAgriSimulationRequest;
  if (!body.crop || !body.region || !Number.isFinite(body.fieldSizeHa)) {
    return NextResponse.json({ error: "Invalid simulation input." }, { status: 400 });
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `SpaceAgri error ${res.status}: ${text || "unknown error"}` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as SpaceAgriSimulation[];
  return NextResponse.json({ simulations: data });
}
