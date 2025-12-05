"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Activity,
  CreditCard,
  Leaf,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const { user, isConnected, isLoadingUser, convexConfigured, address } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRole = searchParams.get("role");
  const [activeTab, setActiveTab] = useState<"household" | "farmer">(
    urlRole === "farmer" ? "farmer" : "household"
  );

  useEffect(() => {
    if (!isConnected) {
      router.replace("/sign-in");
    } else if (convexConfigured && !isLoadingUser && !user) {
      router.replace("/sign-in");
    }
  }, [convexConfigured, isConnected, isLoadingUser, router, user]);

  useEffect(() => {
    if (user?.role === "household" || user?.role === "farmer") {
      setActiveTab(user.role as "household" | "farmer");
    }
  }, [user]);

  const statusCopy = useMemo(() => {
    if (!isConnected) return "Connect your wallet to view your agents.";
    if (convexConfigured && isLoadingUser) return "Loading your Field2Fridge profile…";
    if (convexConfigured && !user) return "No profile found. Finish onboarding first.";
    return null;
  }, [convexConfigured, isConnected, isLoadingUser, user]);

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
            Signed in as {user?.role ?? "wallet user"} — {address}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/settings">Safety settings</Link>
          </Button>
          <Button asChild>
            <Link href={`/household/pantry`}>Open workspace</Link>
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "household" | "farmer")} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="household">Household</TabsTrigger>
          <TabsTrigger value="farmer">Farmer</TabsTrigger>
        </TabsList>

        <TabsContent value="household" className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Pantry risk</CardTitle>
                <CardDescription>Forecasted run-outs in the next 7 days.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">3 items</p>
                  <p className="text-sm text-muted-foreground">Milk, eggs, rice</p>
                </div>
                <ShoppingBag className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Spend guardrails</CardTitle>
                <CardDescription>Weekly budget vs projected carts.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">$54 / $80</p>
                  <p className="text-sm text-muted-foreground">On track this week</p>
                </div>
                <CreditCard className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Safety state</CardTitle>
                <CardDescription>Allowlists, caps, and audit logging.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">Locked in</p>
                  <p className="text-sm text-muted-foreground">Ready for x402 flows</p>
                </div>
                <Lock className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Upcoming cart</CardTitle>
              <CardDescription>
                Generated from recent consumption patterns and vendor preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-medium">Vendor</p>
                <p className="text-muted-foreground">Amazon sandbox</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-medium">Est. total</p>
                <p className="text-muted-foreground">$47.20</p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-medium">Approval window</p>
                <p className="text-muted-foreground">Auto-approve under $60</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="farmer" className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Yield outlook</CardTitle>
                <CardDescription>Last SpaceAgri simulation.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">4.2 t/ha</p>
                  <p className="text-sm text-muted-foreground">Variety X123</p>
                </div>
                <Leaf className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">ZK proof</CardTitle>
                <CardDescription>Sustainability attestation on Midnight.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">Valid</p>
                  <p className="text-sm text-muted-foreground">Shared with buyers</p>
                </div>
                <Sparkles className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Agent health</CardTitle>
                <CardDescription>ASI Agentverse heartbeat & logs.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold">Live</p>
                  <p className="text-sm text-muted-foreground">Last sync: 2 min ago</p>
                </div>
                <Activity className="h-10 w-10 text-primary" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Next actions</CardTitle>
              <CardDescription>
                Queue up the next Midnight proof and x402 metered analytics call.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/privacy/midnight">
                  Generate ZK proof
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href="/farmer/fields">
                  Run SpaceAgri simulation
                  <Leaf className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link href="/settings">
                  Trigger x402 premium call
                  <CreditCard className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
