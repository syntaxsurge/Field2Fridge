const SPACEAGRI_BASE_URL =
  process.env.SPACEAGRI_BASE_URL || "https://api.spaceagri.example";
const SPACEAGRI_API_KEY = process.env.SPACEAGRI_API_KEY;

export type SpaceAgriSimulation = {
  variety: string;
  expectedYieldTPerHa: number;
  traitScore: number;
  notes?: string;
};

const fallbackSimulations: SpaceAgriSimulation[] = [
  { variety: "X123", expectedYieldTPerHa: 4.2, traitScore: 82, notes: "Balanced drought resistance and yield." },
  { variety: "Y210", expectedYieldTPerHa: 3.9, traitScore: 78, notes: "Higher resilience, slightly lower yield." },
];

export async function runSimulation(params: {
  crop: string;
  region: string;
  fieldSizeHa: number;
}) {
  if (!SPACEAGRI_API_KEY) {
    return fallbackSimulations;
  }

  const res = await fetch(`${SPACEAGRI_BASE_URL}/v1/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SPACEAGRI_API_KEY,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SpaceAgri error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as SpaceAgriSimulation[];
  return data;
}
