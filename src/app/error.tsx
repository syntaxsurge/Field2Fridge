"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-muted px-6">
        <div className="max-w-lg rounded-xl bg-background p-6 shadow">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">
            We hit an unexpected error while rendering this page. Guardrails are in place; no on-chain actions were
            attempted.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || "Unknown error"} {error.digest ? `(digest: ${error.digest})` : null}
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => reset()}>Retry</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Back home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
