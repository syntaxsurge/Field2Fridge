import { fetchDailyClimate } from "@/lib/api/nasa-power";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SimulationBody = {
  crop?: string;
  region?: string;
  fieldSizeHa?: number;
  latitude?: number;
  longitude?: number;
};

type VarietyModel = {
  variety: string;
  baseYield: number;
  idealTempRange: [number, number];
  idealRainfall: number;
  droughtTolerance: number; // 0-1
  heatTolerance: number; // 0-1
  notes: string;
};

const VARIETY_LIBRARY: Record<string, VarietyModel[]> = {
  Wheat: [
    {
      variety: "OptiWheat-9",
      baseYield: 7.2,
      idealTempRange: [12, 24],
      idealRainfall: 420,
      droughtTolerance: 0.7,
      heatTolerance: 0.6,
      notes: "Balanced winter wheat suited for temperate zones.",
    },
    {
      variety: "DroughtShield-5",
      baseYield: 6.4,
      idealTempRange: [10, 26],
      idealRainfall: 360,
      droughtTolerance: 0.9,
      heatTolerance: 0.7,
      notes: "Drought-tolerant line prioritizing stability over peak yield.",
    },
    {
      variety: "Sunrich-12",
      baseYield: 7.8,
      idealTempRange: [14, 28],
      idealRainfall: 500,
      droughtTolerance: 0.6,
      heatTolerance: 0.8,
      notes: "High-radiation performer that prefers consistent moisture.",
    },
  ],
  Corn: [
    {
      variety: "HelioMaize-A",
      baseYield: 9.5,
      idealTempRange: [18, 32],
      idealRainfall: 520,
      droughtTolerance: 0.5,
      heatTolerance: 0.8,
      notes: "Hybrid tuned for strong solar exposure with moderate water needs.",
    },
    {
      variety: "DryGuard-M3",
      baseYield: 8.3,
      idealTempRange: [16, 30],
      idealRainfall: 420,
      droughtTolerance: 0.85,
      heatTolerance: 0.7,
      notes: "Resilient under rainfall deficits; steadier but slightly lower peak yield.",
    },
    {
      variety: "CoolBurst-7",
      baseYield: 8.9,
      idealTempRange: [15, 28],
      idealRainfall: 480,
      droughtTolerance: 0.65,
      heatTolerance: 0.65,
      notes: "Prefers cooler nights; balanced choice for mixed climates.",
    },
  ],
  Rice: [
    {
      variety: "PaddyPrime-X",
      baseYield: 6.1,
      idealTempRange: [20, 30],
      idealRainfall: 700,
      droughtTolerance: 0.55,
      heatTolerance: 0.7,
      notes: "Irrigated systems with steady rainfall perform best.",
    },
    {
      variety: "AeroRice-Delta",
      baseYield: 5.6,
      idealTempRange: [18, 30],
      idealRainfall: 620,
      droughtTolerance: 0.75,
      heatTolerance: 0.75,
      notes: "Handles intermittent drought and heat spikes without sharp drops.",
    },
    {
      variety: "ShadeField-IR",
      baseYield: 5.3,
      idealTempRange: [19, 29],
      idealRainfall: 650,
      droughtTolerance: 0.6,
      heatTolerance: 0.6,
      notes: "Stable performer for cloudier regions with reliable moisture.",
    },
  ],
};

const DEFAULT_COORDS = { latitude: 39.8283, longitude: -98.5795 }; // US central ag belt for demo

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SimulationBody;
  const crop = (body.crop ?? "Wheat").trim() || "Wheat";
  const region = (body.region ?? "Demo-region").trim() || "Demo-region";
  const fieldSizeHa = Number.isFinite(body.fieldSizeHa) ? Number(body.fieldSizeHa) : 10;
  const latitude = Number.isFinite(body.latitude) ? Number(body.latitude) : DEFAULT_COORDS.latitude;
  const longitude = Number.isFinite(body.longitude) ? Number(body.longitude) : DEFAULT_COORDS.longitude;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 });
  }

  const today = new Date();
  const start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  const startDate = formatDate(start);
  const endDate = formatDate(today);

  try {
    const climate = await fetchDailyClimate({
      latitude,
      longitude,
      startDate,
      endDate,
    });

    const { recommendations, riskScore } = deriveRecommendations(crop, climate);

    return NextResponse.json({
      recommendations,
      climate,
      riskScore,
      context: {
        crop,
        region,
        fieldSizeHa,
        latitude,
        longitude,
      },
    });
  } catch (err) {
    console.error("Climate simulation failed", err);
    return NextResponse.json(
      { error: "Simulation failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

function deriveRecommendations(crop: string, climate: Awaited<ReturnType<typeof fetchDailyClimate>>) {
  const varieties = VARIETY_LIBRARY[crop] ?? VARIETY_LIBRARY.Wheat;
  const recommendations = varieties
    .map((v) => buildRecommendation(v, climate))
    .sort((a, b) => b.traitScore - a.traitScore);

  const rainfallPenalty = Math.max(0, Math.min(1, Math.abs(climate.totalRainfallMm - meanIdealRainfall(varieties)) / 800));
  const heatPenalty = Math.max(0, Math.min(1, (climate.meanTemperatureC - meanIdealTemp(varieties)) / 20));
  const droughtPenalty = Math.max(0, Math.min(1, climate.droughtDays / 90));
  const riskScore = Math.min(1, (rainfallPenalty * 0.4 + heatPenalty * 0.3 + droughtPenalty * 0.3));

  return { recommendations, riskScore };
}

function buildRecommendation(model: VarietyModel, climate: Awaited<ReturnType<typeof fetchDailyClimate>>) {
  const { baseYield, idealRainfall, idealTempRange, droughtTolerance, heatTolerance } = model;

  const rainfallFactor = clamp(climate.totalRainfallMm / idealRainfall, 0.6, 1.25);
  const heatStress =
    climate.meanTemperatureC > idealTempRange[1]
      ? clamp((climate.meanTemperatureC - idealTempRange[1]) / 12, 0, 0.35)
      : climate.meanTemperatureC < idealTempRange[0]
        ? clamp((idealTempRange[0] - climate.meanTemperatureC) / 15, 0, 0.2)
        : 0;
  const droughtStress = clamp((climate.droughtDays / climate.periodDays) * (1 - droughtTolerance), 0, 0.4);

  const adjustedYield = baseYield * rainfallFactor * (1 - heatStress) * (1 - droughtStress);

  const traitScore = Math.round(
    clamp(
      70 +
        heatTolerance * 15 +
        droughtTolerance * 10 -
        heatStress * 30 -
        Math.max(0, 1 - rainfallFactor) * 15,
      10,
      99
    )
  );

  const rationale = [
    `Mean temp ${climate.meanTemperatureC.toFixed(1)}°C vs target ${idealTempRange[0]}–${idealTempRange[1]}°C`,
    `Rainfall ${climate.totalRainfallMm.toFixed(0)} mm vs target ${idealRainfall} mm`,
    `${climate.droughtDays} drought days with tolerance factor ${droughtTolerance}`,
  ].join(" · ");

  return {
    variety: model.variety,
    expectedYieldTPerHa: Number(adjustedYield.toFixed(2)),
    traitScore,
    notes: model.notes,
    rationale,
  };
}

function meanIdealRainfall(varieties: VarietyModel[]) {
  const total = varieties.reduce((sum, v) => sum + v.idealRainfall, 0);
  return total / varieties.length;
}

function meanIdealTemp(varieties: VarietyModel[]) {
  const avg = varieties.reduce((sum, v) => sum + (v.idealTempRange[0] + v.idealTempRange[1]) / 2, 0);
  return avg / varieties.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
