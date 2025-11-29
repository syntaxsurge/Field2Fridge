"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartSuggestion, PantryItem, buildCartSuggestions } from "@/features/household/services/cart";
import { useMemo, useState } from "react";

const pantry: PantryItem[] = [
  { name: "Milk", quantity: 2, unit: "L", avgDailyUse: 0.6 },
  { name: "Eggs", quantity: 10, unit: "pcs", avgDailyUse: 2 },
  { name: "Rice", quantity: 1.2, unit: "kg", avgDailyUse: 0.15 },
];

export default function CartPage() {
  const suggestions = useMemo(() => buildCartSuggestions(pantry), []);
  const [log, setLog] = useState<string[]>([]);

  const handleApprove = (cart: CartSuggestion[]) => {
    const total = cart.reduce((sum, item) => sum + item.estimatedCost, 0);
    setLog((prev) => [
      `Approved cart ($${total.toFixed(2)}): ${cart.map((c) => `${c.name} x${c.suggestedQty}`).join(", ")}`,
      ...prev,
    ]);
  };

  const handleDecline = () => {
    setLog((prev) => [`Declined suggested cart at ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Household</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Auto-cart</h1>
        <p className="text-muted-foreground">
          Suggested carts stay within your spend cap and vendor allowlist. Approve to trigger sandbox checkout.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended cart</CardTitle>
          <CardDescription>Based on run-out risk for the next 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3 text-sm font-medium text-muted-foreground">
            <span>Item</span>
            <span>Qty</span>
            <span>Reason</span>
            <span>Est. cost</span>
          </div>
          {suggestions.map((s) => (
            <div
              key={s.name}
              className="grid grid-cols-4 items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="font-medium">{s.name}</span>
              <span>
                {s.suggestedQty} {s.unit}
              </span>
              <span className="text-muted-foreground">{s.reason}</span>
              <span>${s.estimatedCost.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => handleApprove(suggestions)}>Approve &amp; create sandbox cart</Button>
            <Button variant="outline" onClick={handleDecline}>
              Decline &amp; recompute
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log (local)</CardTitle>
          <CardDescription>Decisions are logged with timestamps for review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {log.length === 0 && <p className="text-muted-foreground">No decisions yet.</p>}
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
