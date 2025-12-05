"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PantryItem, daysUntilEmpty } from "@/features/household/services/cart";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMemo, useState } from "react";

export default function PantryPage() {
  const { user, isConnected, isLoadingUser, convexConfigured } = useCurrentUser();
  const items = useQuery(
    api.functions.pantry.getPantryItems,
    user ? { userId: user._id } : "skip"
  );
  const upsertItem = useMutation(api.functions.pantry.upsertPantryItem);
  const logAudit = useMutation(api.functions.audit.logAuditEvent);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [form, setForm] = useState<PantryItem>({
    name: "",
    quantity: 0,
    unit: "pcs",
    avgDailyUse: 0,
  });

  const handleSave = async () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to save pantry items.");
      return;
    }
    if (!form.name.trim()) {
      setError("Item name is required.");
      return;
    }
    setError(undefined);
    setStatus("Saving item...");
    try {
      await upsertItem({
        userId: user._id,
        name: form.name.trim(),
        quantity: Number.isFinite(form.quantity) ? form.quantity : 0,
        unit: form.unit.trim() || "pcs",
        avgDailyUse: Number.isFinite(form.avgDailyUse) ? form.avgDailyUse ?? 0 : 0,
      });
      await logAudit({
        userId: user._id,
        type: "pantry_item",
        payload: {
          name: form.name.trim(),
          quantity: form.quantity,
          unit: form.unit,
          avgDailyUse: form.avgDailyUse,
        },
      });
      setStatus("Saved");
      setForm({ name: "", quantity: 0, unit: "pcs", avgDailyUse: 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus(undefined), 1500);
    }
  };

  const list = useMemo(() => {
    if (!items) return [] as PantryItem[];
    return items.map((item) => ({
      name: typeof item.name === "string" ? item.name : "Unknown",
      quantity: typeof item.quantity === "number" ? item.quantity : 0,
      unit: typeof item.unit === "string" ? item.unit : "unit",
      avgDailyUse: typeof item.avgDailyUse === "number" ? item.avgDailyUse : 0,
    }));
  }, [items]);
  const loading = items === undefined || isLoadingUser;

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Pantry</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> and redeploy to enable real-time pantry storage.
          </p>
        </div>
      </main>
    );
  }

  if (!isConnected || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Pantry</h1>
          <p className="text-muted-foreground">
            Connect your wallet and finish onboarding to track inventory and compute run-outs.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Pantry</h1>
          <p className="text-muted-foreground">
            Track stock, detect run-outs early, and feed the auto-cart.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Live view of pantry items and risk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading pantry items…</p>}
            {!loading && list.length === 0 && (
              <p className="text-sm text-muted-foreground">No items yet. Add stock levels to compute run-outs.</p>
            )}
            {!loading && list.length > 0 && (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-3 text-sm font-medium text-muted-foreground">
                  <span>Item</span>
                  <span>Quantity</span>
                  <span>Days left</span>
                  <span>Status</span>
                </div>
                {list.map((item) => {
                  const days = daysUntilEmpty(item);
                  const status =
                    days === Infinity ? "Unknown" : days <= 3 ? "Critical" : days <= 7 ? "Watch" : "Healthy";
                  return (
                    <div
                      key={`${item.name}-${item.unit}`}
                      className="grid grid-cols-4 items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                      <span>{days === Infinity ? "—" : days.toFixed(1)}</span>
                      <Badge variant={status === "Healthy" ? "outline" : "secondary"}>{status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add / Update item</CardTitle>
            <CardDescription>Store consumption so the agent can forecast run-outs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Milk"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value || "0") }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="pcs / kg / L"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg">Average daily use</Label>
              <Input
                id="avg"
                type="number"
                value={form.avgDailyUse}
                onChange={(e) => setForm((f) => ({ ...f, avgDailyUse: parseFloat(e.target.value || "0") }))}
              />
              <p className="text-xs text-muted-foreground">Example: 0.6 L/day for milk.</p>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={!!status}>
              {status ?? "Save"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
