"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldSimulationResponse, VarietyRecommendation, runSimulation } from "@/lib/api/agroclimate";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useState } from "react";
import { WorkspaceShortcuts } from "@/components/layout/workspace-shortcuts";

export default function FieldsPage() {
  const { user, isConnected, convexConfigured } = useCurrentUser();
  const [crop, setCrop] = useState("Wheat");
  const [region, setRegion] = useState("Great Plains");
  const [fieldSize, setFieldSize] = useState(10);
  const [latitude, setLatitude] = useState(39.8283);
  const [longitude, setLongitude] = useState(-98.5795);
  const [results, setResults] = useState<VarietyRecommendation[]>([]);
  const [simulation, setSimulation] = useState<FieldSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const saveSimulation = useMutation(api.functions.farmer.saveSimulation);
  const history = useQuery(
    api.functions.farmer.listSimulations,
    user ? { userId: user._id, limit: 10 } : "skip"
  );

  const submit = async () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to run simulations.");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const data = await runSimulation({ crop, region, fieldSizeHa: fieldSize, latitude, longitude });
      setSimulation(data);
      setResults(data.recommendations);
      const top = data.recommendations[0];
      if (top) {
        await saveSimulation({
          userId: user._id,
          crop,
          region,
          fieldSizeHa: fieldSize,
          result: top,
          riskScore: data.riskScore,
          climate: {
            meanTempC: data.climate.meanTemperatureC,
            totalRainfallMm: data.climate.totalRainfallMm,
            meanSolarKwhM2: data.climate.meanSolarKwhM2,
            droughtDays: data.climate.droughtDays,
            periodStart: data.climate.startDate,
            periodEnd: data.climate.endDate,
            latitude,
            longitude,
          },
        });
      }
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
      setSimulation(null);
    } finally {
      setLoading(false);
    }
  };

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Farmer</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Field planner</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> to run and save NASA-powered simulations.
          </p>
        </div>
      </main>
    );
  }

  if (!isConnected || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Farmer</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Field planner</h1>
          <p className="text-muted-foreground">
            Connect your wallet and finish onboarding as a farmer to simulate yields.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Farmer</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Field planner</h1>
        <p className="text-muted-foreground">
          Use open agroclimate data (NASA POWER) to stress-test varieties and forecast yields per field.
        </p>
      </div>

      <WorkspaceShortcuts
        links={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/farmer/fields", label: "Fields" },
          { href: "/household/pantry", label: "Household" },
          { href: "/copilot", label: "Copilot" },
          { href: "/settings", label: "Settings" },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Simulation inputs</CardTitle>
          <CardDescription>Provide field context to get trait-aware recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="crop">Crop</Label>
            <Input id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Great Plains" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Field size (ha)</Label>
            <Input
              id="size"
              type="number"
              value={fieldSize}
              onChange={(e) => setFieldSize(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value || "0"))}
              placeholder="e.g. 39.8283"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value || "0"))}
              placeholder="e.g. -98.5795"
            />
          </div>
          <div className="md:col-span-3 lg:col-span-5">
            <Button onClick={submit} disabled={loading}>
              {loading ? "Running..." : "Run simulation"}
            </Button>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>

      {simulation && (
        <Card>
          <CardHeader>
            <CardTitle>Climate snapshot</CardTitle>
            <CardDescription>
              NASA POWER daily data ({simulation.climate.startDate} → {simulation.climate.endDate})
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Mean temperature</p>
              <p className="text-xl font-semibold">{simulation.climate.meanTemperatureC.toFixed(1)} °C</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Rainfall (total)</p>
              <p className="text-xl font-semibold">{simulation.climate.totalRainfallMm.toFixed(0)} mm</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Drought days</p>
              <p className="text-xl font-semibold">{simulation.climate.droughtDays}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Solar irradiance</p>
              <p className="text-xl font-semibold">{simulation.climate.meanSolarKwhM2.toFixed(2)} kWh/m²/day</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm text-muted-foreground">Risk score</p>
              <p className="text-xl font-semibold">{Math.round(simulation.riskScore * 100)}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recommended varieties</CardTitle>
          <CardDescription>Sorted by trait score with estimated yields.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No simulations yet. Run a query to see ranked varieties backed by NASA climate data.
            </p>
          )}
          {results.map((sim) => (
            <div
              key={sim.variety}
              className="grid gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm md:grid-cols-4"
            >
              <div>
                <span className="font-medium">{sim.variety}</span>
                <p className="text-xs text-muted-foreground">{sim.notes ?? "—"}</p>
              </div>
              <span>{sim.expectedYieldTPerHa.toFixed(2)} t/ha</span>
              <span>Trait score {sim.traitScore}</span>
              <span className="text-muted-foreground">{sim.rationale}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Saved results per wallet for judges to verify.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {history === undefined && <p className="text-muted-foreground">Loading history…</p>}
          {history && history.length === 0 && (
            <p className="text-muted-foreground">No saved runs yet. Execute a simulation to persist results.</p>
          )}
          {history &&
            history.map((entry) => {
              const variety = typeof entry.variety === "string" ? entry.variety : "Unknown";
              const expectedYield =
                typeof entry.expectedYieldTPerHa === "number" ? entry.expectedYieldTPerHa : 0;
              const traitScore = typeof entry.traitScore === "number" ? entry.traitScore : 0;
              const cropLabel = typeof entry.crop === "string" ? entry.crop : "Unknown crop";
              const regionLabel = typeof entry.region === "string" ? entry.region : "Unknown region";
              const requestedAt =
                typeof entry.requestedAt === "number" ? entry.requestedAt : Date.now();
              const rainfall =
                typeof entry.totalRainfallMm === "number" ? `${entry.totalRainfallMm.toFixed(0)} mm` : null;
              const risk =
                typeof entry.riskScore === "number" ? `${Math.round(entry.riskScore * 100)}% risk` : null;
              const meanTemp = typeof entry.meanTempC === "number" ? `${entry.meanTempC.toFixed(1)}°C` : null;

              return (
                <div
                  key={(entry._id ? entry._id.toString() : `${variety}-${requestedAt}`) as string}
                  className="grid gap-3 rounded border bg-muted/40 px-3 py-2 md:grid-cols-4"
                >
                  <span className="font-medium">{variety}</span>
                  <span>{expectedYield.toFixed(2)} t/ha</span>
                  <span>Score {traitScore}</span>
                  <span className="text-muted-foreground">
                    {cropLabel} — {regionLabel} ({new Date(requestedAt).toLocaleString()})
                  </span>
                  {(risk || rainfall || meanTemp) && (
                    <span className="text-xs text-muted-foreground md:col-span-3">
                      {risk ? `${risk}` : ""} {rainfall ? `• Rainfall ${rainfall}` : ""}{" "}
                      {meanTemp ? `• Avg temp ${meanTemp}` : ""}
                    </span>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>
    </main>
  );
}
