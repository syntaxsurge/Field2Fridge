"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartSuggestion, summarizeCart } from "@/features/household/services/cart";
import { HouseholdNavTabs } from "@/components/layout/household-nav-tabs";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { recordAgentWebhook } from "@/lib/api/cart-agent";

export default function CartPage() {
  const { user, isConnected, convexConfigured, isLoadingUser } = useCurrentUser();
  const cartData = useQuery(
    api.functions.household.getCartSuggestions,
    user ? { userId: user._id } : "skip"
  );
  const events = useQuery(api.functions.household.listCartEvents, user ? { userId: user._id } : "skip");
  const recordDecision = useMutation(api.functions.household.recordCartDecision);
  const updateCartStatus = useMutation(api.functions.household.updateCartStatus);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const vendor = cartData?.vendor ?? null;
  const lastEvent = events && events.length > 0 ? events[0] : null;
  const lastStatus = lastEvent?.fulfillmentStatus;

  const approve = async (cart: CartSuggestion[]) => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to approve carts.");
      return;
    }
    if (!vendor) {
      setError("No allowed vendors set. Update Safety & Controls to allow at least one vendor.");
      return;
    }
    setStatus("Submitting approval...");
    setError(undefined);
    try {
      await recordDecision({ userId: user._id, decision: "approved", vendor, cart });
      setStatus("Approved");
      toast.success("Cart approved", {
        description: "Sandbox cart created under your current caps.",
      });
      await recordAgentWebhook({
        wallet: user.wallet,
        items: cart.map((c) => `${c.name} x${c.suggestedQty} ${c.unit}`),
        totalUsd: summarizeCart(cart).total,
        decision: "approved",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus(undefined), 1400);
    }
  };

  const decline = async () => {
    if (!user) {
      setError("Connect your wallet and finish onboarding to decline carts.");
      return;
    }
    setStatus("Declining...");
    setError(undefined);
    try {
      await recordDecision({
        userId: user._id,
        decision: "declined",
        vendor: vendor ?? undefined,
        cart: cartData?.suggestions ?? [],
      });
      setStatus("Declined");
      toast.message("Cart declined", {
        description: "We’ll recompute suggestions on the next data refresh.",
      });
      await recordAgentWebhook({
        wallet: user.wallet,
        items: cartData?.suggestions?.map((c) => `${c.name} x${c.suggestedQty} ${c.unit}`) ?? [],
        totalUsd: summarizeCart(cartData?.suggestions ?? []).total,
        decision: "declined",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus(undefined), 1400);
    }
  };

  const markFulfilled = async () => {
    if (!user || !lastEvent) return;
    setStatus("Marking fulfilled...");
    try {
      await updateCartStatus(
        {
          userId: user._id,
          cartEventId: lastEvent._id as Id<"cart_events">,
          fulfillmentStatus: "fulfilled",
        }
      );
      setStatus("Fulfilled");
      toast.success("Marked fulfilled", { description: "Last cart marked as fulfilled." });
      await recordAgentWebhook({
        wallet: user.wallet,
        items: Array.isArray(lastEvent.items)
          ? lastEvent.items.map((c) => `${(c as { name?: string }).name ?? "item"} x${(c as { suggestedQty?: number }).suggestedQty ?? "?"} ${(c as { unit?: string }).unit ?? ""}`)
          : [],
        totalUsd: typeof lastEvent.total === "number" ? lastEvent.total : 0,
        decision: "fulfilled",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTimeout(() => setStatus(undefined), 1400);
    }
  };

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-12 md:px-10">
        <div className="space-y-2">
          <Badge className="w-fit">Household</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Auto-cart</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> to generate carts from your pantry and guardrails.
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
          <h1 className="text-3xl font-semibold md:text-4xl">Auto-cart</h1>
          <p className="text-muted-foreground">Connect your wallet to see suggestions and approve carts.</p>
        </div>
      </main>
    );
  }

  const loading = cartData === undefined || isLoadingUser;
  const suggestions = cartData?.suggestions ?? [];
  const summary = summarizeCart(suggestions);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Household</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">Auto-cart</h1>
        <p className="text-muted-foreground">
          Suggested carts stay within your spend cap and vendor allowlist. Approve to trigger sandbox checkout.
        </p>
        {user?.prefs?.txWarnings && (
          <p className="text-sm text-amber-600">
            Transaction warnings enabled — we will block anything over your caps or outside allowlists.
          </p>
        )}
      </div>

      <HouseholdNavTabs />

      <Card>
        <CardHeader>
          <CardTitle>Recommended cart</CardTitle>
          <CardDescription>
            Based on run-out risk for the next 7 days and your approval rules.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading suggestions…</p>}
          {!loading && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No suggestions yet. Add pantry items and set guardrails to generate a cart.
            </p>
          )}
          {!loading && suggestions.length > 0 && (
            <>
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
              <div className="grid grid-cols-3 gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                <div>
                  <p className="font-medium">Vendor</p>
                  <p className="text-muted-foreground">{cartData?.vendor ?? "None allowed"}</p>
                </div>
                <div>
                  <p className="font-medium">Est. total</p>
                  <p className="text-muted-foreground">${summary.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-medium">Approval mode</p>
                  <p className="text-muted-foreground">
                    {cartData?.approvalMode === "auto"
                      ? `Auto-approve under $${cartData.perOrderCap.toFixed(2)} cap`
                      : "Always ask"}
                  </p>
                </div>
              </div>
             <div className="flex flex-wrap gap-3">
               <Button onClick={() => approve(suggestions)} disabled={!!status || suggestions.length === 0}>
                 {status ?? "Approve & create sandbox cart"}
               </Button>
               <Button variant="outline" onClick={decline} disabled={!!status}>
                 Decline &amp; recompute
               </Button>
                {lastEvent && lastEvent.fulfillmentStatus === "pending" && (
                  <Button variant="secondary" onClick={markFulfilled} disabled={!!status}>
                    Mark fulfilled
                  </Button>
                )}
                {lastStatus && (
                  <p className="text-xs text-muted-foreground">
                    Last cart status: {String(lastStatus)}{" "}
                    {lastEvent?.vendor ? `(vendor: ${lastEvent.vendor as string})` : ""}
                  </p>
                )}
              </div>
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Decisions recorded against your wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {events === undefined && <p className="text-muted-foreground">Loading history…</p>}
          {events && events.length === 0 && (
            <p className="text-muted-foreground">No decisions yet. Approve or decline a cart to record activity.</p>
          )}
          {events &&
            events.map((entry) => {
              const decision = typeof entry.decision === "string" ? entry.decision : "unknown";
              const createdAt =
                typeof entry.createdAt === "number" ? entry.createdAt : Date.now();
              const total = typeof entry.total === "number" ? entry.total : 0;
              const items = Array.isArray(entry.items) ? entry.items : [];
              const key =
                entry._id && typeof entry._id.toString === "function"
                  ? entry._id.toString()
                  : `${decision}-${createdAt}`;
              return (
                <div key={key} className="rounded border bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{decision}</span>
                    <span className="text-muted-foreground">
                      {new Date(createdAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.vendor && (
                    <p className="text-xs text-muted-foreground">Vendor: {String(entry.vendor)}</p>
                  )}
                  {entry.fulfillmentStatus && (
                    <p className="text-xs text-muted-foreground">Status: {String(entry.fulfillmentStatus)}</p>
                  )}
                  <p className="text-muted-foreground">
                    {items.length} items — ${total.toFixed(2)}
                  </p>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </main>
  );
}
