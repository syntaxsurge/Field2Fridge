import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ShieldCheck, ShoppingBag, Sprout } from "lucide-react";
import Link from "next/link";

const featureCards = [
  {
    title: "Household autopilot",
    description:
      "Predict run-outs, build compliant carts, and approve in one click with spend caps and audit logs.",
    icon: ShoppingBag,
    href: "/dashboard",
  },
  {
    title: "Farmer intelligence",
    description:
      "SpaceAgri trait scoring, yield simulations, and signed attestations for sustainable harvests on BNB.",
    icon: Sprout,
    href: "/dashboard",
  },
  {
    title: "Trusted & private",
    description:
      "BNB + x402 micropayments, uAgent + Agentverse presence, and zk attestations for zero-knowledge sharing.",
    icon: ShieldCheck,
    href: "/dashboard",
  },
];

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 pb-16 pt-20 md:px-10">
      <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <Badge className="rounded-full px-3 py-1 text-sm">
            Field2Fridge · Autonomous food supply agents
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              From farm to fridge, agents forecast, prove, and pay on your behalf.
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              One network of agents that keeps households stocked, helps farmers
              certify sustainable yields, and executes Web3 actions with
              guardrails, privacy, and gas-sponsored signatures.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/sign-in">
                Launch app
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-lg border bg-card/60 p-4 shadow-sm">
              <p className="font-semibold text-foreground">
                Privacy-first by design
              </p>
              <p>Encrypted attestations and Unibase memory keep data sovereign on BNB.</p>
            </div>
            <div className="rounded-lg border bg-card/60 p-4 shadow-sm">
              <p className="font-semibold text-foreground">Ready for testnets</p>
              <p>
                BNB testnet, x402 micropayments, and ChainGPT audits baked in.
              </p>
            </div>
          </div>
        </div>
        <Card className="border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader>
            <CardTitle>Agent status</CardTitle>
            <CardDescription>
              What your Field2Fridge agent does for you every day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium">Inventory watch</p>
                <p className="text-muted-foreground">
                  Tracks pantry signals and predicts run-outs per item.
                </p>
              </div>
              <Badge variant="outline">Real-time</Badge>
            </div>
            <div className="flex items-start justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium">Crop simulations</p>
                <p className="text-muted-foreground">
                  Pulls SpaceAgri trait scores and yield forecasts for your fields.
                </p>
              </div>
              <Badge variant="outline">Nightly</Badge>
            </div>
            <div className="flex items-start justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium">Safe execution</p>
                <p className="text-muted-foreground">
                  Previews BNB/x402 transactions with caps and allowlists.
                </p>
              </div>
              <Badge variant="outline">Guarded</Badge>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard">Open control center</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Why builders pick us
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              One agent network, three high-impact surfaces.
            </h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <Card key={card.title} className="flex flex-col">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{card.title}</Badge>
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href={card.href}>Explore</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
