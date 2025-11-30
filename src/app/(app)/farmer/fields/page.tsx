"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpaceAgriSimulation, runSimulation } from "@/lib/api/spaceagri";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useState } from "react";

export default function FieldsPage() {
  const { user, isConnected, convexConfigured } = useCurrentUser();
  const [crop, setCrop] = useState("Wheat");
  const [region, setRegion] = useState("UK-South");
  const [fieldSize, setFieldSize] = useState(10);
  const [results, setResults] = useState<SpaceAgriSimulation[]>([]);
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
      const data = await runSimulation({ crop, region, fieldSizeHa: fieldSize });
      setResults(data);
      const top = data[0];
      if (top) {
        await saveSimulation({
          userId: user._id,
          crop,
          region,
          fieldSizeHa: fieldSize,
          result: top,
        });
      }
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
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
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> and SpaceAgri env vars to run and save simulations.
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
          Use SpaceAgri simulations to choose traits and predict yields per variety.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulation inputs</CardTitle>
          <CardDescription>Provide field context to get trait-aware recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="crop">Crop</Label>
            <Input id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. UK-South" />
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
          <div className="md:col-span-3">
            <Button onClick={submit} disabled={loading}>
              {loading ? "Running..." : "Run simulation"}
            </Button>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended varieties</CardTitle>
          <CardDescription>Sorted by trait score with estimated yields.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">No simulations yet. Run a query to see ranked varieties.</p>
          )}
          {results.map((sim) => (
            <div
              key={sim.variety}
              className="grid grid-cols-4 items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="font-medium">{sim.variety}</span>
              <span>{sim.expectedYieldTPerHa.toFixed(2)} t/ha</span>
              <span>Trait score {sim.traitScore}</span>
              <span className="text-muted-foreground">{sim.notes ?? "—"}</span>
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

              return (
                <div
                  key={(entry._id ? entry._id.toString() : `${variety}-${requestedAt}`) as string}
                  className="grid grid-cols-4 items-center gap-3 rounded border bg-muted/40 px-3 py-2"
                >
                  <span className="font-medium">{variety}</span>
                  <span>{expectedYield.toFixed(2)} t/ha</span>
                  <span>Score {traitScore}</span>
                  <span className="text-muted-foreground">
                    {cropLabel} — {regionLabel} ({new Date(requestedAt).toLocaleString()})
                  </span>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </main>
  );
}
