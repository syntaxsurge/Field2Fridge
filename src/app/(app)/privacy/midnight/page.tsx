"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSustainabilityProof } from "@/lib/api/midnight";
import { useState } from "react";

type Metrics = {
  soilHealth: number;
  waterUse: number;
  pesticideUse: number;
};

export default function MidnightPage() {
  const [farmId, setFarmId] = useState("farm-001");
  const [crop, setCrop] = useState("Wheat");
  const [threshold, setThreshold] = useState(75);
  const [metrics, setMetrics] = useState<Metrics>({ soilHealth: 82, waterUse: 12, pesticideUse: 1.1 });
  const [status, setStatus] = useState<string>();
  const [proof, setProof] = useState<{ proofId: string; commitment: string; submittedAt: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setLoading(true);
    setError(undefined);
    setStatus("Generating proof with Compact + MidnightJS...");
    try {
      const result = await generateSustainabilityProof({
        farmId,
        crop,
        threshold,
        metrics,
      });
      setProof(result);
      setStatus("Proof submitted to Midnight prover.");
    } catch (err) {
      setError((err as Error).message);
      setStatus(undefined);
      setProof(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Privacy</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Midnight sustain-proof</h1>
        <p className="text-muted-foreground">
          Create a zero-knowledge attestation that your field meets sustainability thresholds without revealing inputs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Private inputs</CardTitle>
          <CardDescription>Only the ZK proof is shared; raw metrics stay private.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="farm">Farm ID</Label>
              <Input id="farm" value={farmId} onChange={(e) => setFarmId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop">Crop</Label>
              <Input id="crop" value={crop} onChange={(e) => setCrop(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Sustainability threshold</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value || "0"))}
            />
            <p className="text-xs text-muted-foreground">The proof checks score &gt;= threshold.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="soil">Soil health score</Label>
              <Input
                id="soil"
                type="number"
                value={metrics.soilHealth}
                onChange={(e) => setMetrics((m) => ({ ...m, soilHealth: parseFloat(e.target.value || "0") }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">Water use (L/m²)</Label>
              <Input
                id="water"
                type="number"
                value={metrics.waterUse}
                onChange={(e) => setMetrics((m) => ({ ...m, waterUse: parseFloat(e.target.value || "0") }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pest">Pesticide use (kg/ha)</Label>
              <Input
                id="pest"
                type="number"
                value={metrics.pesticideUse}
                onChange={(e) => setMetrics((m) => ({ ...m, pesticideUse: parseFloat(e.target.value || "0") }))}
              />
            </div>
          </div>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Proving..." : "Generate proof"}
          </Button>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest proof</CardTitle>
          <CardDescription>Shareable commitment without revealing private metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!proof && <p className="text-muted-foreground">No proof yet.</p>}
          {proof && (
            <div className="space-y-1 rounded border bg-muted/40 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Proof ID</span>
                <span>{proof.proofId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Commitment</span>
                <span className="truncate">{proof.commitment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Submitted</span>
                <span>{new Date(proof.submittedAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                In production this would link to Midnight explorer; here we keep the commitment for judges.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
