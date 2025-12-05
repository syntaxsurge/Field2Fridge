"use client";

import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useQuery } from "convex/react";
import {
  Activity,
  CreditCard,
  Leaf,
  Lock,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

export default function DashboardPage() {
  const { user, isConnected, isLoadingUser, convexConfigured, address } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRole = searchParams.get("role");
  const role: "household" | "farmer" =
    user?.role === "farmer" || urlRole === "farmer" ? "farmer" : "household";

  const householdOverview = useQuery(
    api.functions.household.overview,
    user ? { userId: user._id } : "skip"
  );
  const latestSimulation = useQuery(
    api.functions.farmer.latestSimulation,
    user ? { userId: user._id } : "skip"
  );
  const auditEvents = useQuery(
    api.functions.audit.listAuditEvents,
    user ? { userId: user._id, limit: 5 } : "skip"
  );

  useEffect(() => {
    if (!isConnected) {
      router.replace("/sign-in");
    } else if (convexConfigured && !isLoadingUser && !user) {
      router.replace("/sign-in");
    }
  }, [convexConfigured, isConnected, isLoadingUser, router, user]);

  const statusCopy = useMemo(() => {
    if (!isConnected) return "Connect your wallet to view your agents.";
    if (convexConfigured && isLoadingUser) return "Loading your Field2Fridge profile…";
    if (convexConfigured && !user) return "No profile found. Finish onboarding first.";
    return null;
  }, [convexConfigured, isConnected, isLoadingUser, user]);

  const riskyNames = householdOverview?.riskyNames ?? [];
  const upcomingCart = householdOverview?.upcomingCart;
  const latestYield =
    latestSimulation && typeof latestSimulation.expectedYieldTPerHa === "number"
      ? `${latestSimulation.expectedYieldTPerHa.toFixed(2)} t/ha`
      : null;
  const latestVariety = latestSimulation?.variety ?? null;
  const latestRegion = latestSimulation?.region ?? null;
  const latestRisk =
    latestSimulation && typeof latestSimulation.riskScore === "number"
      ? `${Math.round(latestSimulation.riskScore * 100)}%`
      : null;
  const registryAddress = CONTRACT_ADDRESSES.bscTestnet.Field2FridgeAgentRegistry;
  const serviceTokenAddress = CONTRACT_ADDRESSES.bscTestnet.Field2FridgeServiceToken;
  const workspaceHref = user?.role === "farmer" ? "/farmer/fields" : "/household/pantry";
  const roleLabel = role === "farmer" ? "farmer" : "household";

  const shorten = (val: string) => (val.length > 12 ? `${val.slice(0, 6)}…${val.slice(-4)}` : val);
  const explorerBase = "https://testnet.bscscan.com/address/";

  if (!convexConfigured) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-20 md:px-10">
        <header className="space-y-3">
          <Badge className="w-fit">Control center</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Ops snapshot for your agents</h1>
          <p className="text-muted-foreground">
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> to load household and farmer data.
          </p>
        </header>
      </main>
    );
  }

  if (statusCopy) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 pb-16 pt-20 md:px-10">
        <header className="space-y-3">
          <Badge className="w-fit">Control center</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">Ops snapshot for your agents</h1>
          <p className="text-muted-foreground">{statusCopy}</p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/sign-in">Go to onboarding</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 md:px-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge className="w-fit">Control center</Badge>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Ops snapshot for your agents
          </h1>
          <p className="text-muted-foreground">
            Track pantry risk, cart approvals, simulations, and proofs at a
            glance. Real data streams in once you connect your wallet.
          </p>
          <p className="text-sm text-muted-foreground">
            Signed in as {user?.role ?? "wallet user"} — {address ?? "No address"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings">Safety settings</Link>
          </Button>
          <Button asChild>
            <Link href={workspaceHref}>Open workspace</Link>
          </Button>
          {role === "farmer" && (
            <Button variant="secondary" asChild>
              <Link href="/farmer/fields">Run climate simulation</Link>
            </Button>
          )}
          <Button variant="secondary" asChild>
            <Link href="/copilot">Copilot</Link>
          </Button>
        </div>
      </header>

      {role === "farmer" ? (
        <div className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Yield outlook</CardTitle>
                <CardDescription>Last agroclimate simulation (NASA POWER).</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">
                    {latestSimulation === undefined
                      ? "…"
                      : latestYield ?? "No runs"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {latestSimulation === undefined
                      ? "Loading"
                      : latestYield
                        ? `${latestVariety ?? "Unknown"} — ${latestRegion ?? "Unknown"}${
                            latestRisk ? ` · Risk ${latestRisk}` : ""
                          }`
                        : "Run a simulation to populate"}
                  </p>
                </div>
                <Leaf className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Agent activity</CardTitle>
                <CardDescription>Recent audit trail entries.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">
                    {auditEvents === undefined ? "…" : `${auditEvents.length} event${auditEvents.length === 1 ? "" : "s"}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {auditEvents === undefined ? "Loading logs" : "Wallet-scoped events in Convex"}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card className="h-full">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Registry &amp; token</CardTitle>
                <CardDescription>BNB testnet addresses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Agent registry:{" "}
                  <Link href={`${explorerBase}${registryAddress}`} className="font-mono text-primary underline-offset-4 hover:underline">
                    {shorten(registryAddress)}
                  </Link>
                </p>
                <p className="text-muted-foreground">
                  Service token:{" "}
                  <Link href={`${explorerBase}${serviceTokenAddress}`} className="font-mono text-primary underline-offset-4 hover:underline">
                    {shorten(serviceTokenAddress)}
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
              <CardDescription>
                Queue up the next agroclimate simulation and review guardrails.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/farmer/fields">
                  Run climate simulation
                  <Leaf className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/settings">
                  Review guardrails
                  <CreditCard className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/household/pantry" className="block">
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Pantry risk</CardTitle>
                  <CardDescription>Forecasted run-outs in the next 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold">
                      {householdOverview === undefined
                        ? "…"
                        : `${householdOverview.riskyCount} item${householdOverview.riskyCount === 1 ? "" : "s"}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {householdOverview === undefined
                        ? "Computing risk…"
                        : riskyNames.length > 0
                          ? riskyNames.join(", ")
                          : "No items at risk"}
                    </p>
                  </div>
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/household/controls" className="block">
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Spend guardrails</CardTitle>
                  <CardDescription>Weekly budget vs approved carts.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold">
                      {householdOverview === undefined
                        ? "…"
                        : `$${householdOverview.spentThisWeek.toFixed(2)} / $${householdOverview.weeklyBudget.toFixed(2)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {householdOverview === undefined
                        ? "Loading"
                        : householdOverview.spentThisWeek > householdOverview.weeklyBudget
                          ? "Over weekly budget"
                          : "Tracking approved spend"}
                    </p>
                  </div>
                  <CreditCard className="h-10 w-10 text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/household/controls" className="block">
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-lg">Safety state</CardTitle>
                  <CardDescription>Allowlists, caps, and audit logging.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold">
                      {householdOverview === undefined
                        ? "…"
                        : householdOverview.approvalMode === "auto"
                          ? `Auto < $${householdOverview.perOrderCap.toFixed(0)}`
                          : "Manual approvals"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {householdOverview === undefined
                        ? "Loading"
                        : `${Object.values(householdOverview.vendors).filter(Boolean).length} vendors allowed`}
                    </p>
                  </div>
                  <Lock className="h-10 w-10 text-primary" />
                </CardContent>
              </Card>
            </Link>
            <Card className="h-full">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">On-chain identity</CardTitle>
                <CardDescription>Registry and service token on BNB testnet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Agent registry</p>
                  <Link
                    href={`${explorerBase}${registryAddress}`}
                    target="_blank"
                    className="text-primary underline underline-offset-2"
                  >
                    {shorten(registryAddress)}
                  </Link>
                </div>
                <div>
                  <p className="text-muted-foreground">Service token</p>
                  <Link
                    href={`${explorerBase}${serviceTokenAddress}`}
                    target="_blank"
                    className="text-primary underline underline-offset-2"
                  >
                    {shorten(serviceTokenAddress)}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Wallet: {address ? shorten(address) : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
          <Link href="/household/cart" className="block">
            <Card className="transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle>Upcoming cart</CardTitle>
                <CardDescription>
                  Generated from recent consumption patterns and vendor preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-3">
                {householdOverview === undefined && (
                  <p className="text-muted-foreground">Loading upcoming cart…</p>
                )}
                {householdOverview && !upcomingCart && (
                  <p className="text-muted-foreground">
                    No cart generated yet. Add pantry items and enable vendors to create a suggestion.
                  </p>
                )}
                {upcomingCart && (
                  <>
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="font-medium">Vendor</p>
                      <p className="text-muted-foreground">{upcomingCart.vendor ?? "None"}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="font-medium">Est. total</p>
                      <p className="text-muted-foreground">${upcomingCart.total.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/50 p-3">
                      <p className="font-medium">Approval window</p>
                      <p className="text-muted-foreground">
                        {upcomingCart.autoApproveUnder
                          ? `Auto-approve under $${upcomingCart.autoApproveUnder.toFixed(0)}`
                          : "Manual review required"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </main>
  );
}
