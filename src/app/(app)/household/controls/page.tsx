"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HouseholdNavTabs } from "@/components/layout/household-nav-tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Check } from "lucide-react";

type ControlsState = {
  weeklyBudget: number;
  perOrderCap: number;
  vendors: Record<string, boolean>;
  approvalMode: "ask" | "auto";
};

const defaultControls: ControlsState = {
  weeklyBudget: 80,
  perOrderCap: 60,
  vendors: { "Local Co-op": true, Amazon: true, Walmart: true },
  approvalMode: "ask",
};

export default function ControlsPage() {
  const { user, isConnected, convexConfigured, isLoadingUser } = useCurrentUser();
  const settings = useQuery(
    api.functions.household.fetchSettings,
    user ? { userId: user._id } : "skip"
  );
  const saveSettings = useMutation(api.functions.household.saveSettings);
  const logAudit = useMutation(api.functions.audit.logAuditEvent);
  const [controls, setControls] = useState<ControlsState>(defaultControls);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [toastMessage, setToastMessage] = useState<string>();

  useEffect(() => {
    if (settings) {
      const mergedVendors = {
        "Local Co-op": true,
        Amazon: true,
        Walmart: true,
        ...settings.vendors,
      };
      setControls({
        weeklyBudget: settings.weeklyBudget,
        perOrderCap: settings.perOrderCap,
        approvalMode: settings.approvalMode as "ask" | "auto",
        vendors: mergedVendors,
      });
    }
  }, [settings]);

  const vendorList = useMemo(() => Object.keys(controls.vendors), [controls.vendors]);

  const toggleVendor = (name: string) => {
    setControls((prev) => ({ ...prev, vendors: { ...prev.vendors, [name]: !prev.vendors[name] } }));
  };

  const save = () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to save controls.");
      return;
    }
    setError(undefined);
    setStatus("Saving controls...");
    saveSettings({
      userId: user._id,
      weeklyBudget: controls.weeklyBudget,
      perOrderCap: controls.perOrderCap,
      approvalMode: controls.approvalMode,
      vendors: controls.vendors,
    })
      .then(async () => {
        setStatus("Saved");
        setToastMessage("Controls saved. Future carts will honor these guardrails.");
        toast.success("Controls saved", {
          description: "New caps and vendor rules will apply to future carts.",
        });
        if (user.prefs?.telemetry !== false) {
          await logAudit({
            userId: user._id,
            type: "household_controls",
            payload: controls,
          });
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => {
        setTimeout(() => setStatus(undefined), 1500);
        setTimeout(() => setToastMessage(undefined), 2400);
      });
  };

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; Controls</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> to persist guardrails per wallet.
          </p>
        </div>
      </main>
    );
  }

  if (!isConnected || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; Controls</h1>
          <p className="text-muted-foreground">
            Connect your wallet to view and enforce spend caps, vendors, and approval modes.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Household</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; Controls</h1>
        <p className="text-muted-foreground">
          Spend caps, vendor allowlists, and approval modes the agent must follow.
        </p>
        {toastMessage && <p className="text-sm text-emerald-600">{toastMessage}</p>}
      </div>

      <HouseholdNavTabs />

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
              <Label htmlFor="cap">Per-order auto-approval cap (USD)</Label>
              <Input
                id="cap"
                type="number"
                value={controls.perOrderCap}
                onChange={(e) =>
                  setControls((prev) => ({ ...prev, perOrderCap: parseFloat(e.target.value || "0") }))
                }
              />
              <p className="text-sm text-muted-foreground">
                We auto-approve carts at or below this cap when auto-approval is on.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Allow/deny marketplaces for sandbox orders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendorList.map((vendor) => {
              const allowed = Boolean(controls.vendors[vendor]);
              return (
                <Button
                  key={vendor}
                  variant={allowed ? "secondary" : "outline"}
                  className="w-full justify-between"
                  onClick={() => toggleVendor(vendor)}
                >
                  <span className="font-medium">{vendor}</span>
                  {allowed && <Check className="h-4 w-4" />}
                </Button>
              );
            })}
            <p className="text-sm text-muted-foreground">
              Auto-cart will only propose orders from allowed vendors.
            </p>
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
            Auto-approve under cap
          </Button>
          <div className="flex-1" />
          <Button onClick={save} disabled={!!status || isLoadingUser}>
            {status ?? "Save controls"}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
