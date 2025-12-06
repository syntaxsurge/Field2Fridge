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
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { api } from "../../../convex/_generated/api";
import { Lock, Wallet, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAccount } from "wagmi";

type Role = "household" | "farmer";

export function SignInPanel() {
  const convexEnabled = useMemo(() => Boolean(process.env.NEXT_PUBLIC_CONVEX_URL), []);

  if (!convexEnabled) {
    return (
      <Card className="max-w-2xl">
        <CardHeader className="space-y-2">
          <Badge className="w-fit">Secure by design</Badge>
          <CardTitle className="text-2xl">Connect wallet to sign in</CardTitle>
          <CardDescription>
            Configure <code>NEXT_PUBLIC_CONVEX_URL</code> in your environment to enable onboarding and profile storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-card/70 p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Wallet connection available</p>
                <p className="text-sm text-muted-foreground">
                  Add your Convex deployment URL to persist profiles per wallet.
                </p>
              </div>
            </div>
            <ConnectButton accountStatus="avatar" showBalance={false} />
          </div>
          <Button variant="outline" className="w-full" disabled>
            Configure Convex to continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <SignInPanelWithConvex />;
}

function SignInPanelWithConvex() {
  const router = useRouter();
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();
  const { user, isLoadingUser } = useCurrentUser();
  const createProfile = useMutation(api.functions.users.createOrUpdateUser);
  const [activeRole, setActiveRole] = useState<Role>("household");
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (user && isConnected) {
      router.replace(`/dashboard?role=${user.role ?? "household"}`);
    }
  }, [isConnected, router, user]);

  const handleContinue = async () => {
    setError(undefined);
    if (!isConnected || !address) {
      openConnectModal?.();
      setError("Connect your wallet to continue.");
      return;
    }

    try {
      setStatus("Creating your profile...");
      await createProfile({ wallet: address, role: activeRole });
      router.push(`/dashboard?role=${activeRole}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus(undefined);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader className="space-y-2">
        <Badge className="w-fit">Secure by design</Badge>
        <CardTitle className="text-2xl">Sign in with your wallet</CardTitle>
        <CardDescription>
          Connect a BNB wallet to create your Field2Fridge profile. We enforce
          spend caps, allowlists, and audit trails out of the box.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="household" className="w-full" onValueChange={(val) => setActiveRole(val as Role)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="household">Household</TabsTrigger>
            <TabsTrigger value="farmer">Farmer</TabsTrigger>
          </TabsList>
          <TabsContent value="household" className="space-y-3 pt-4 text-sm">
            <p className="text-muted-foreground">
              Track pantry inventory, predict run-outs, and approve carts with
              spend caps. No passwords to lose—your wallet is your identity.
            </p>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Lock className="h-4 w-4 text-primary" />
              <span>We never store secrets. Approvals stay in your wallet.</span>
            </div>
          </TabsContent>
          <TabsContent value="farmer" className="space-y-3 pt-4 text-sm">
            <p className="text-muted-foreground">
              Run SpaceAgri simulations, generate signed attestations, and offer
              tokenized services on BNB Chain. Your wallet anchors your agent identity.
            </p>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
              <Zap className="h-4 w-4 text-primary" />
              <span>Agentverse-ready with audit logs for every action.</span>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/70 p-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Connect wallet to continue</p>
              <p className="text-sm text-muted-foreground">
                BNB testnet by default; switch networks from the modal.
              </p>
            </div>
          </div>
          <ConnectButton accountStatus="avatar" showBalance={false} />
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleContinue} disabled={!!status || isLoadingUser}>
            {status ?? (user ? "Go to dashboard" : "Continue to onboarding")}
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!error && status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
