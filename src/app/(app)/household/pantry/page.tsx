"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PantryItem, daysUntilEmpty } from "@/features/household/services/cart";
import { useState } from "react";

const initialItems: PantryItem[] = [
  { name: "Milk", quantity: 2, unit: "L", avgDailyUse: 0.6 },
  { name: "Eggs", quantity: 10, unit: "pcs", avgDailyUse: 2 },
  { name: "Rice", quantity: 1.2, unit: "kg", avgDailyUse: 0.15 },
];

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>(initialItems);
  const [form, setForm] = useState<PantryItem>({
    name: "",
    quantity: 0,
    unit: "pcs",
    avgDailyUse: 0,
  });

  const addItem = () => {
    if (!form.name) return;
    setItems((prev) => [...prev, form]);
    setForm({ name: "", quantity: 0, unit: "pcs", avgDailyUse: 0 });
  };

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
            <div className="grid grid-cols-4 gap-3 text-sm font-medium text-muted-foreground">
              <span>Item</span>
              <span>Quantity</span>
              <span>Days left</span>
              <span>Status</span>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
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
            <Button onClick={addItem} className="w-full">
              Save
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
