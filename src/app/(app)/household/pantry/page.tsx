"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HouseholdNavTabs } from "@/components/layout/household-nav-tabs";
import { PantryItem, daysUntilEmpty } from "@/features/household/services/cart";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMemo, useState } from "react";

const UNIT_OPTIONS = ["pcs", "kg", "g", "L", "mL", "packs", "bottles"];

type PantryListItem = PantryItem & { _id?: Id<"pantry_items"> };
const DEFAULT_FORM: PantryItem = { name: "", quantity: 0, unit: "pcs", avgDailyUse: 0 };

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
  const [form, setForm] = useState<PantryItem>({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<Id<"pantry_items"> | null>(null);

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
      const payload = {
        userId: user._id,
        id: editingId ?? undefined,
        name: form.name.trim(),
        quantity: Number.isFinite(form.quantity) ? form.quantity : 0,
        unit: form.unit.trim() || "pcs",
        avgDailyUse: Number.isFinite(form.avgDailyUse) ? form.avgDailyUse ?? 0 : 0,
      };
      const savedId = await upsertItem(payload);
      await logAudit({
        userId: user._id,
        type: "pantry_item",
        payload: {
          action: editingId ? "update" : "create",
          id: savedId ?? editingId ?? undefined,
          name: form.name.trim(),
          quantity: form.quantity,
          unit: form.unit,
          avgDailyUse: form.avgDailyUse,
        },
      });
      setStatus("Saved");
      setForm({ ...DEFAULT_FORM });
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus(undefined), 1500);
    }
  };

  const list = useMemo(() => {
    if (!items) return [] as PantryListItem[];
    return items.map((item) => ({
      _id: item._id as Id<"pantry_items">,
      name: typeof item.name === "string" ? item.name : "Unknown",
      quantity: typeof item.quantity === "number" ? item.quantity : 0,
      unit: typeof item.unit === "string" ? item.unit : "unit",
      avgDailyUse: typeof item.avgDailyUse === "number" ? item.avgDailyUse : 0,
    }));
  }, [items]);
  const loading = items === undefined || isLoadingUser;

  const onSelectItem = (item: PantryListItem) => {
    setEditingId(item._id ?? null);
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      avgDailyUse: item.avgDailyUse ?? 0,
    });
  };

  const resetForm = () => {
    setForm({ ...DEFAULT_FORM });
    setEditingId(null);
  };

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

      <HouseholdNavTabs />

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
                    days === Infinity
                      ? "Unknown"
                      : days > 5
                        ? "Comfortable"
                        : days > 2
                          ? "Watch"
                          : "Critical";
                  const isEditing = editingId && item._id && editingId === item._id;
                  const key =
                    item._id && typeof item._id.toString === "function"
                      ? item._id.toString()
                      : `${item.name}-${item.unit}`;
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectItem(item);
                        }
                      }}
                      className={`grid grid-cols-4 items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm transition hover:border-primary/60 hover:bg-background ${
                        isEditing ? "border-primary bg-background" : ""
                      }`}
                    >
                      <span className="font-medium">{item.name}</span>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                      <span>{days === Infinity ? "—" : days.toFixed(1)}</span>
                      <Badge
                        variant={
                          status === "Comfortable"
                            ? "outline"
                            : status === "Watch"
                              ? "secondary"
                              : "secondary"
                        }
                      >
                        {status}
                      </Badge>
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
                <Select value={form.unit} onValueChange={(value: string) => setForm((f) => ({ ...f, unit: value }))}>
                  <SelectTrigger id="unit" aria-label="Select unit">
                    <SelectValue placeholder="Choose a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} className="w-full" disabled={!!status}>
                {status ?? (editingId ? "Update item" : "Save item")}
              </Button>
              {editingId && (
                <Button variant="outline" className="w-full" onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
