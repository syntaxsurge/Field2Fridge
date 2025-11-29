"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type ControlsState = {
  weeklyBudget: number;
  perOrderCap: number;
  vendors: Record<string, boolean>;
  approvalMode: "ask" | "auto";
};

const defaultControls: ControlsState = {
  weeklyBudget: 120,
  perOrderCap: 70,
  vendors: { Amazon: true, Walmart: false, "Local Co-op": true },
  approvalMode: "ask",
};

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlsState>(defaultControls);
  const [log, setLog] = useState<string[]>([]);

  const toggleVendor = (name: string) => {
    setControls((prev) => ({ ...prev, vendors: { ...prev.vendors, [name]: !prev.vendors[name] } }));
  };

  const save = () => {
    setLog((prev) => [
      `Updated controls at ${new Date().toLocaleTimeString()} — weekly $${controls.weeklyBudget}, cap $${controls.perOrderCap}, mode ${controls.approvalMode}`,
      ...prev,
    ]);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Household</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; Controls</h1>
        <p className="text-muted-foreground">
          Spend caps, vendor allowlists, and approval modes the agent must follow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Hard limits for weekly spend and per-order approvals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weekly">Weekly budget (USD)</Label>
              <Input
                id="weekly"
                type="number"
                value={controls.weeklyBudget}
                onChange={(e) =>
                  setControls((prev) => ({ ...prev, weeklyBudget: parseFloat(e.target.value || "0") }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cap">Per-order cap (USD)</Label>
              <Input
                id="cap"
                type="number"
                value={controls.perOrderCap}
                onChange={(e) =>
                  setControls((prev) => ({ ...prev, perOrderCap: parseFloat(e.target.value || "0") }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Allow/deny marketplaces for sandbox orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(controls.vendors).map((vendor) => (
              <label key={vendor} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="font-medium">{vendor}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={controls.vendors[vendor]}
                  onChange={() => toggleVendor(vendor)}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval mode</CardTitle>
          <CardDescription>Decide how aggressive the auto-cart can be.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={controls.approvalMode === "ask" ? "default" : "outline"}
            onClick={() => setControls((prev) => ({ ...prev, approvalMode: "ask" }))}
          >
            Ask me every time
          </Button>
          <Button
            variant={controls.approvalMode === "auto" ? "default" : "outline"}
            onClick={() => setControls((prev) => ({ ...prev, approvalMode: "auto" }))}
          >
            Auto-approve under caps
          </Button>
          <div className="flex-1" />
          <Button onClick={save}>Save controls</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit trail (local)</CardTitle>
          <CardDescription>Recent policy changes for review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {log.length === 0 && <p className="text-muted-foreground">No changes yet.</p>}
          {log.map((entry, idx) => (
            <div key={idx} className="rounded border bg-muted/40 px-3 py-2">
              {entry}
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
