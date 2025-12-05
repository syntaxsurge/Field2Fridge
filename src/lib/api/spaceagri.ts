export type SpaceAgriSimulation = {
  variety: string;
  expectedYieldTPerHa: number;
  traitScore: number;
  notes?: string;
};

export type SpaceAgriSimulationRequest = {
  crop: string;
  region: string;
  fieldSizeHa: number;
};

export async function runSimulation(params: SpaceAgriSimulationRequest) {
  const res = await fetch("/api/spaceagri/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const payload = (await res.json().catch(() => null)) as
    | { simulations: SpaceAgriSimulation[]; error?: string }
    | null;

  if (!res.ok) {
    throw new Error(payload?.error ?? `SpaceAgri error ${res.status}`);
  }

  return payload?.simulations ?? [];
}
