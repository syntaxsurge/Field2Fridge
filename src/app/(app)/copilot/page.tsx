"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type Message = { role: "user" | "assistant"; content: string };

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const { user } = useCurrentUser();
  const logAudit = useMutation(api.functions.audit.logAuditEvent);

  const ask = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setStatus("Thinking...");
    setError(undefined);
    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ChainGPT request failed");
      }
      const answer = data.answer ?? "No answer";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      if (user?._id) {
        await logAudit({
          userId: user._id,
          type: "copilot_chat",
          payload: { question, answer },
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus(undefined);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Copilot</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">ChainGPT copilot</h1>
        <p className="text-muted-foreground">
          Ask the Web3-aware assistant to explain carts, previews, or simulations. Premium actions can require
          x402 payments; this surface enforces caps before any on-chain suggestion.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>Answers are powered by ChainGPT.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Ask about your upcoming cart or a transaction preview..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex items-center gap-3">
              <Button onClick={ask} disabled={!!status}>
                {status ?? "Ask"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {!error && status && <p className="text-sm text-muted-foreground">{status}</p>}
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className="rounded-lg border bg-muted/40 px-3 py-2 text-sm"
              >
                <p className="font-semibold">{msg.role === "user" ? "You" : "Copilot"}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No questions yet. Ask about spend caps, cart decisions, or how to run a SpaceAgri simulation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
