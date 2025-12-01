"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";

export default function PrivacyPage() {
  const { user, convexConfigured, isConnected } = useCurrentUser();
  const memories = useQuery(
    api.functions.memory.listMemories,
    user ? { userId: user._id } : "skip"
  );
  const logAudit = useMutation(api.functions.audit.logAuditEvent);
  const [snapshotJson, setSnapshotJson] = useState<string>('{"note":"First memory"}');
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  const pushSnapshot = async () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to sync memory.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(snapshotJson);
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
      return;
    }
    setError(undefined);
    setStatus("Syncing to Membase…");
    try {
      const res = await fetch("/api/membase/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: user.wallet, snapshot: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync memory");
      }
      if (user.prefs?.telemetry !== false) {
        await logAudit({
          userId: user._id,
          type: "memory_snapshot",
          payload: { memoryId: data.memoryId, membase: data.membase },
        });
      }
      setStatus("Synced");
      setTimeout(() => setStatus(undefined), 1400);
    } catch (err) {
      setStatus(undefined);
      setError((err as Error).message);
    }
  };

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Privacy</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Agent memory</h1>
          <p className="text-muted-foreground">Configure Convex and Membase to sync secure snapshots.</p>
        </div>
      </main>
    );
  }

  if (!isConnected || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Privacy</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Agent memory</h1>
          <p className="text-muted-foreground">Connect your wallet to view and sync encrypted memories.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Privacy</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Agent memory</h1>
        <p className="text-muted-foreground">
          Sync snapshots to Membase using your configured agent identity. Telemetry opt-out blocks syncs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync a snapshot</CardTitle>
          <CardDescription>JSON payload will be stored in Convex and signed with Membase secrets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={snapshotJson}
            onChange={(e) => setSnapshotJson(e.target.value)}
            className="min-h-[140px]"
          />
          <div className="flex items-center gap-3">
            <Button onClick={pushSnapshot}>{status ?? "Sync to Membase"}</Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {!error && status && <p className="text-sm text-muted-foreground">{status}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent memory snapshots</CardTitle>
          <CardDescription>Latest 20 entries tied to your wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {memories === undefined && <p className="text-muted-foreground">Loading history…</p>}
          {memories && memories.length === 0 && (
            <p className="text-muted-foreground">No snapshots yet. Sync one above to get started.</p>
          )}
          {memories &&
            memories.map((m) => {
              const id = typeof m._id?.toString === "function" ? m._id.toString() : `${m.createdAt}`;
              const createdAt =
                typeof m.createdAt === "number" || typeof m.createdAt === "bigint"
                  ? Number(m.createdAt)
                  : Date.now();
              return (
                <div key={id} className="rounded border bg-muted/50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Snapshot</span>
                    <span className="text-muted-foreground">{new Date(createdAt).toLocaleString()}</span>
                  </div>
                  <pre className="mt-2 overflow-x-auto rounded bg-background p-2 text-xs">
                    {JSON.stringify(m.snapshot, null, 2)}
                  </pre>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </main>
  );
}
