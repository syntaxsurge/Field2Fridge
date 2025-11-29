"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpaceAgriSimulation, runSimulation } from "@/lib/api/spaceagri";
import { useState } from "react";

export default function FieldsPage() {
  const [crop, setCrop] = useState("Wheat");
  const [region, setRegion] = useState("UK-South");
  const [fieldSize, setFieldSize] = useState(10);
  const [results, setResults] = useState<SpaceAgriSimulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await runSimulation({ crop, region, fieldSizeHa: fieldSize });
      setResults(data);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

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
    </main>
  );
}
