export type VarietyRecommendation = {
  variety: string;
  expectedYieldTPerHa: number;
  traitScore: number;
  notes?: string;
  rationale?: string;
};

export type ClimateSnapshot = {
  startDate: string;
  endDate: string;
  periodDays: number;
  meanTemperatureC: number;
  totalRainfallMm: number;
  meanSolarKwhM2: number;
  droughtDays: number;
};

export type FieldSimulationRequest = {
  crop: string;
  region: string;
  fieldSizeHa: number;
  latitude?: number;
  longitude?: number;
};

export type FieldSimulationResponse = {
  recommendations: VarietyRecommendation[];
  climate: ClimateSnapshot;
  riskScore: number; // 0-1
  context?: {
    crop: string;
    region: string;
    fieldSizeHa: number;
    latitude: number;
    longitude: number;
  };
};

export async function runSimulation(params: FieldSimulationRequest) {
  const res = await fetch("/api/climate/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const payload = (await res.json().catch(() => null)) as FieldSimulationResponse | { error?: string } | null;

  if (!res.ok) {
    throw new Error((payload as { error?: string } | null)?.error ?? `Simulation error ${res.status}`);
  }

  if (!payload || !("recommendations" in payload)) {
    throw new Error("Invalid simulation response");
  }

  return payload;
}
