"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useCurrentUser, UserPrefs } from "@/hooks/use-current-user";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";

type SettingsState = {
  network: "testnet" | "mainnet";
  txWarnings: boolean;
  allowDenyLists: boolean;
  telemetry: boolean;
  maxSpend: number;
};

const defaults: SettingsState = {
  network: "testnet",
  txWarnings: true,
  allowDenyLists: true,
  telemetry: false,
  maxSpend: 250,
};

export default function SettingsPage() {
  const { user, isConnected, convexConfigured, isLoadingUser } = useCurrentUser();
  const [state, setState] = useState<SettingsState>(defaults);
  const [saved, setSaved] = useState<string>();
  const [error, setError] = useState<string>();
  const updatePrefs = useMutation(api.functions.users.updatePrefs);
  const household = useQuery(
    api.functions.household.fetchSettings,
    user ? { userId: user._id } : "skip"
  );

  useEffect(() => {
    if (user?.prefs) {
      const prefs = user.prefs as UserPrefs;
      setState({
        network: prefs.network,
        txWarnings: prefs.txWarnings,
        allowDenyLists: prefs.allowDenyLists,
        telemetry: prefs.telemetry,
        maxSpend: prefs.maxSpend,
      });
    } else {
      setState(defaults);
    }
  }, [user]);

  const save = () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to save settings.");
      return;
    }
    setError(undefined);
    setSaved("Saving…");
    updatePrefs({
      userId: user._id,
      prefs: {
        network: state.network,
        txWarnings: state.txWarnings,
        allowDenyLists: state.allowDenyLists,
        telemetry: state.telemetry,
        maxSpend: state.maxSpend,
      },
    })
      .then(() => setSaved(`Saved at ${new Date().toLocaleTimeString()}`))
      .catch((err) => {
        setSaved(undefined);
        setError((err as Error).message);
      });
  };

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Settings</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; environment</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> to persist settings per wallet.
          </p>
        </div>
      </main>
    );
  }

  if (!isConnected || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Settings</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; environment</h1>
          <p className="text-muted-foreground">
            Connect your wallet to load your saved network, spend, and telemetry preferences.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Settings</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Safety &amp; environment</h1>
        <p className="text-muted-foreground">
          Control network targets, risk warnings, allow/deny enforcement, and telemetry.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Network</CardTitle>
            <CardDescription>Testnet is default for demos; mainnet is guarded.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Button
              variant={state.network === "testnet" ? "default" : "outline"}
              onClick={() => setState((s) => ({ ...s, network: "testnet" }))}
            >
              BNB testnet
            </Button>
            <Button
              variant={state.network === "mainnet" ? "default" : "outline"}
              onClick={() => setState((s) => ({ ...s, network: "mainnet" }))}
            >
              BNB mainnet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend ceiling</CardTitle>
            <CardDescription>Hard cap for any single paid action (USD equivalent).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="maxSpend">Max per request</Label>
            <Input
              id="maxSpend"
              type="number"
              value={state.maxSpend}
              onChange={(e) => setState((s) => ({ ...s, maxSpend: parseFloat(e.target.value || "0") }))}
            />
            <p className="text-xs text-muted-foreground">
              Used by the x402 gateway and Copilot risk checks before submitting transactions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Household guardrails</CardTitle>
            <CardDescription>Live limits from Safety &amp; Controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {household === undefined && <p className="text-muted-foreground">Loading guardrails…</p>}
            {household && (
              <>
                <p>
                  <span className="font-medium">Weekly budget:</span>{" "}
                  ${household.weeklyBudget.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Per-order cap:</span>{" "}
                  ${household.perOrderCap.toFixed(2)} ({household.approvalMode === "auto" ? "auto" : "ask"})
                </p>
                <p>
                  <span className="font-medium">Allowed vendors:</span>{" "}
                  {Object.entries(household.vendors)
                    .filter(([, allowed]) => allowed)
                    .map(([name]) => name)
                    .join(", ") || "None"}
                </p>
                <Link href="/household/controls" className="text-primary underline">
                  Manage vendors and caps
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Protections</CardTitle>
          <CardDescription>Guardrails the agent must enforce before execution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="font-medium">Transaction warnings</p>
              <p className="text-sm text-muted-foreground">Show human-readable previews and risk labels.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={state.txWarnings}
              onChange={() => setState((s) => ({ ...s, txWarnings: !s.txWarnings }))}
            />
          </label>
          <label className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="font-medium">Allow/deny lists</p>
              <p className="text-sm text-muted-foreground">Block unsafe contracts or vendors by policy.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={state.allowDenyLists}
              onChange={() => setState((s) => ({ ...s, allowDenyLists: !s.allowDenyLists }))}
            />
          </label>
          <label className="flex items-center justify-between rounded-md border px-3 py-2">
            <div>
              <p className="font-medium">Telemetry</p>
              <p className="text-sm text-muted-foreground">Share anonymized diagnostics to improve the agent.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={state.telemetry}
              onChange={() => setState((s) => ({ ...s, telemetry: !s.telemetry }))}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button onClick={save} disabled={isLoadingUser}>
              Save
            </Button>
            {saved && <p className="text-sm text-muted-foreground">{saved}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
