"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start gap-4 px-6 pb-16 pt-16 md:px-10">
      <div>
        <p className="text-sm font-medium text-destructive">Something went wrong</p>
        <h1 className="text-3xl font-semibold">We paused the agent</h1>
      </div>
      <p className="text-muted-foreground">
        An error occurred while running this action. No on-chain or premium calls were executed. Details:
      </p>
      <code className="rounded-md bg-muted px-3 py-2 text-sm">{error.message}</code>
      {error.digest && <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>}
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </main>
  );
}
