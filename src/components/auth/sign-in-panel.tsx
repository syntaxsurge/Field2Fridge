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
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, Wallet, Zap } from "lucide-react";

export function SignInPanel() {
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
        <Tabs defaultValue="household" className="w-full">
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
              Run SpaceAgri simulations, generate Midnight proofs, and offer
              tokenized services. Your wallet anchors your agent identity.
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

        <Button variant="outline" className="w-full">
          Continue to onboarding
        </Button>
      </CardContent>
    </Card>
  );
}
