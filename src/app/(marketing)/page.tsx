import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, PlayCircle, ShieldCheck, ShoppingBag, Sprout } from "lucide-react";
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
      "NASA POWER agroclimate scoring, yield simulations, and signed attestations for sustainable harvests on BNB.",
    icon: Sprout,
    href: "/dashboard",
  },
  {
    title: "Trusted & private",
    description:
      "BNB + 402 witness payments, uAgent + Agentverse presence, and zk attestations for zero-knowledge sharing.",
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
                BNB testnet, 402 witness payments, and ChainGPT audits baked in.
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
                  Pulls NASA climate signals and yield forecasts for your fields.
                </p>
              </div>
              <Badge variant="outline">Nightly</Badge>
            </div>
            <div className="flex items-start justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium">Safe execution</p>
                <p className="text-muted-foreground">
                  Previews BNB/402 transactions with caps and allowlists.
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

      <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-primary/5 to-primary/15 shadow-xl">
        <div className="grid gap-10 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12 lg:p-14">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <PlayCircle className="h-4 w-4" />
              Live demo · BNB testnet
            </div>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Watch Field2Fridge in action
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              See the end-to-end run: Akedo-style pantry intelligence, SpaceAgri NASA climate sims,
              ChainGPT copilot research and audits, and a 402 pay-to-execute path on BNB—guarded by
              spend caps, allowlists, and telemetry.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>Pantry → Safety → Cart approvals with simulated Amazon/Walmart payloads.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>Farmer field planner backed by NASA POWER Agroclimatology daily data.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>ChainGPT copilot for Web3 research, contract audits, and 402-gated execution.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <p>ASI/Fetch uAgent bridge that consumes cart decisions for long-term reasoning.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="https://youtu.be/IV46gxrNJew" target="_blank" rel="noreferrer">
                  Open on YouTube
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/sign-in">Launch app</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-background to-background blur-3xl" />
            <div className="overflow-hidden rounded-2xl border shadow-lg shadow-primary/15">
              <div className="aspect-video bg-black/80">
                <iframe
                  title="Field2Fridge demo"
                  src="https://www.youtube.com/embed/IV46gxrNJew"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
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
