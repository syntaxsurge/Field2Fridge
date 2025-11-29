import { SignInPanel } from "@/components/auth/sign-in-panel";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 pb-16 pt-20 md:px-10">
      <div className="space-y-4">
        <Badge className="w-fit">Authentication</Badge>
        <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
          Own your profile with a wallet, not a password.
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Field2Fridge links households and farmers to autonomous agents. We
          use BNB wallets for identity, approvals, and payments so every action
          remains auditable and consented.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>Need a quick peek?</span>
          <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
            Return to overview
          </Link>
        </div>
      </div>
      <SignInPanel />
    </main>
  );
}
