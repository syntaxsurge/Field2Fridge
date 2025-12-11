"use client";

import "@/lib/polyfills/bigint";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { assertWithinPerOrderCap, enforceMaxSpend } from "@/lib/guards/spend";
import { type SignTypedDataParameters, type TypedData } from "viem";
import { useAccount, useSignTypedData } from "wagmi";

type Message = { role: "user" | "assistant"; content: string };
type SignableWitness = SignTypedDataParameters<TypedData, string>;

function isSignableWitness(value: unknown): value is SignableWitness {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SignableWitness>;
  if (!candidate.domain || typeof candidate.domain !== "object") return false;
  if (!candidate.types || typeof candidate.types !== "object") return false;
  if (!candidate.primaryType || typeof candidate.primaryType !== "string") return false;
  if (!candidate.message || typeof candidate.message !== "object") return false;

  return Object.values(candidate.types).every(
    (entries) =>
      Array.isArray(entries) &&
      entries.every(
        (entry) => entry && typeof entry.name === "string" && typeof entry.type === "string"
      )
  );
}

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [auditSource, setAuditSource] = useState("");
  const [auditAddress, setAuditAddress] = useState("");
  const [auditResult, setAuditResult] = useState<string>();
  const [auditStatus, setAuditStatus] = useState<string>();
  const [auditError, setAuditError] = useState<string>();
  const [executeStatus, setExecuteStatus] = useState<string>();
  const [executeResult, setExecuteResult] = useState<string>();
  const [executeError, setExecuteError] = useState<string>();
  const [paymentDetailsDebug, setPaymentDetailsDebug] = useState<string>();
  const [witnessSignatureDebug, setWitnessSignatureDebug] = useState<string>();
  const [actionType, setActionType] = useState<"transfer" | "register">("transfer");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("10");
  const [agentId, setAgentId] = useState("agent-1");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [riskNotes, setRiskNotes] = useState<string>();
  const { user } = useCurrentUser();
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const logAudit = useMutation(api.functions.audit.logAuditEvent);
  const settings = useQuery(
    api.functions.household.fetchSettings,
    user ? { userId: user._id } : "skip"
  );

  const premiumCost = 0.5;

  const ask = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    try {
      assertWithinPerOrderCap(premiumCost, settings?.perOrderCap, "per-order cap");
      enforceMaxSpend(premiumCost, user?.prefs?.maxSpend);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
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
      if (user?._id && user?.prefs?.telemetry !== false) {
        await logAudit({
          userId: user._id,
          type: "copilot_chat",
          payload: { question, answer },
        });
        void fetch("/api/membase/snapshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet: user.wallet,
            snapshot: { question, answer, source: "copilot" },
          }),
        });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus(undefined);
    }
  };

  const runAudit = async () => {
    if (!auditSource && !auditAddress) {
      setAuditResult("Provide source code or a contract address to audit.");
      return;
    }
    setAuditResult(undefined);
    setAuditError(undefined);
    setAuditStatus("Running audit…");
    setExecuteError(undefined);
    const res = await fetch("/api/chaingpt/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: auditSource || undefined,
        contractAddress: auditAddress || undefined,
        chainId: network === "mainnet" ? 56 : 97,
      }),
    });
    setAuditStatus(undefined);
    const data = await res.json();
    if (!res.ok) {
      setAuditError(data.error ?? "Audit failed");
      return;
    }
    const report = data.report ?? "No report returned";
    setAuditResult(report);
    if (user?._id) {
      await logAudit({
        userId: user._id,
        type: "copilot_audit",
        payload: { auditAddress, report },
      });
    }
  };

  const estimateUsd = useMemo(() => {
    if (actionType === "transfer") {
      const amt = parseFloat(amount || "0");
      return isFinite(amt) ? Math.max(amt, 0) : 0;
    }
    return 1;
  }, [actionType, amount]);

  const executeAction = async () => {
    setExecuteError(undefined);
    setExecuteStatus("Preparing payment…");
    setExecuteResult(undefined);
    setRiskNotes(undefined);
    setWitnessSignatureDebug(undefined);
    setPaymentDetailsDebug(undefined);

    if (!address || !user) {
      setExecuteError("Connect your wallet to execute.");
      setExecuteStatus(undefined);
      return;
    }

    const payload =
      actionType === "transfer"
        ? {
            actionType,
            to: recipient as `0x${string}`,
            amount,
            network: network === "mainnet" ? "bscMainnet" : "bscTestnet",
          }
        : {
            actionType,
            agentId,
            owner: address as `0x${string}`,
            network: network === "mainnet" ? "bscMainnet" : "bscTestnet",
          };

    if (actionType === "transfer") {
      if (!payload.to || !payload.to.startsWith("0x")) {
        setExecuteError("Enter a valid recipient address.");
        setExecuteStatus(undefined);
        return;
      }
      if (!Number.isFinite(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setExecuteError("Enter a positive amount to transfer.");
        setExecuteStatus(undefined);
        return;
      }
    } else if (!agentId.trim()) {
      setExecuteError("Provide an agent id to register.");
      setExecuteStatus(undefined);
      return;
    }

    const paymentRes = await fetch("/api/actions/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, wallet: address, usdEstimate: estimateUsd }),
    });

    const paymentJson = await paymentRes.json().catch(() => ({}));
    setPaymentDetailsDebug(JSON.stringify(paymentJson, null, 2));

    if (paymentRes.status !== 402) {
      if (!paymentRes.ok) {
        setExecuteError(paymentJson.error ?? "Execution failed");
        setExecuteStatus(undefined);
        return;
      }

      const txHash = paymentJson.txHash ?? paymentJson.hash ?? "unknown";
      setExecuteResult(typeof txHash === "string" ? txHash : JSON.stringify(paymentJson));
      setExecuteStatus(undefined);
      if (user?.prefs?.telemetry !== false) {
        await logAudit({
          userId: user._id,
          type: "onchain_action",
          payload: { actionType, txHash, riskNotes },
        });
      }
      return;
    }

    const witness = (paymentJson as { witness?: unknown }).witness;

    if (!isSignableWitness(witness)) {
      setExecuteError("Gateway did not provide a valid witness to sign.");
      setExecuteStatus(undefined);
      return;
    }

    // Request ChainGPT risk notes for preview
    const riskPrompt =
      actionType === "transfer"
        ? `Explain risks for transferring ${amount} service tokens to ${recipient} on BNB ${network}.`
        : `Explain risks for registering agent ${agentId} for ${address} on BNB ${network}.`;
    const riskRes = await fetch("/api/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: riskPrompt }),
    }).catch(() => null);
    if (riskRes?.ok) {
      const riskData = await riskRes.json();
      if (riskData.answer) setRiskNotes(riskData.answer);
    }

    setExecuteStatus("Signing payment witness…");
    let signature: `0x${string}`;
    try {
      signature = await signTypedDataAsync(witness);
      setWitnessSignatureDebug(signature);
    } catch (err) {
      setExecuteError((err as Error).message ?? "Failed to sign payment witness");
      setExecuteStatus(undefined);
      return;
    }

    setExecuteStatus("Submitting signed payment…");
    const execRes = await fetch("/api/actions/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        wallet: address,
        usdEstimate: estimateUsd,
        witness,
        signature,
      }),
    });

    const execJson = await execRes.json().catch(() => ({}));
    if (!execRes.ok) {
      setExecuteError(execJson.error ?? "Execution failed");
      setExecuteStatus(undefined);
      return;
    }

    const txHash = execJson.txHash ?? execJson.hash ?? "unknown";
    setExecuteResult(typeof txHash === "string" ? txHash : JSON.stringify(execJson));
    setExecuteStatus(undefined);
    if (user?.prefs?.telemetry !== false) {
      await logAudit({
        userId: user._id,
        type: "onchain_action",
        payload: { actionType, txHash, riskNotes },
      });
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 pb-16 pt-12 md:px-10">
      <div className="space-y-2">
        <Badge className="w-fit">Copilot</Badge>
        <h1 className="text-3xl font-semibold md:text-4xl">ChainGPT copilot</h1>
        <p className="text-muted-foreground">
          Ask the Web3-aware assistant to explain carts, previews, or simulations. Premium actions can require
          402 witness-signing; this surface enforces caps before any on-chain suggestion.
        </p>
      </div>

      <Tabs defaultValue="research">
        <TabsList className="mb-4">
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
        </TabsList>

        <TabsContent value="research">
          <Card>
            <CardHeader>
              <CardTitle>Research</CardTitle>
              <CardDescription>ChainGPT Web3 LLM for explanations and planning.</CardDescription>
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
                    No questions yet. Ask about spend caps, cart decisions, or how to run a NASA climate simulation.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit</CardTitle>
              <CardDescription>ChainGPT Smart Contract Auditor (source or address).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Label htmlFor="auditSource">Solidity source (optional)</Label>
              <Textarea
                id="auditSource"
                value={auditSource}
                onChange={(e) => setAuditSource(e.target.value)}
                className="min-h-[140px]"
                placeholder="Paste Solidity contract here..."
              />
              <Label htmlFor="auditAddress">Contract address (optional)</Label>
              <Input
                id="auditAddress"
                value={auditAddress}
                onChange={(e) => setAuditAddress(e.target.value)}
                placeholder="0x..."
              />
              <div className="flex items-center gap-3">
                <Button onClick={runAudit} disabled={!!auditStatus}>
                  {auditStatus ?? "Run audit"}
                </Button>
                {(auditResult || auditError) && (
                  <p className="text-sm text-muted-foreground">
                    {auditError ? "Audit failed" : "Audit ready"}
                  </p>
                )}
              </div>
              {auditError && (
                <p className="text-sm text-destructive">{auditError}</p>
              )}
              {auditResult && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                  {auditResult}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execute">
          <Card>
            <CardHeader>
              <CardTitle>Execute (402)</CardTitle>
              <CardDescription>Pay-gated actions with EIP-712 witness signing and policy checks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={actionType === "transfer" ? "default" : "outline"}
                      onClick={() => setActionType("transfer")}
                    >
                      Transfer token
                    </Button>
                    <Button
                      variant={actionType === "register" ? "default" : "outline"}
                      onClick={() => setActionType("register")}
                    >
                      Register agent
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Network</Label>
                  <div className="flex gap-2">
                    <Button variant={network === "testnet" ? "default" : "outline"} onClick={() => setNetwork("testnet")}>
                      BNB testnet
                    </Button>
                    <Button variant={network === "mainnet" ? "default" : "outline"} onClick={() => setNetwork("mainnet")}>
                      BNB mainnet
                    </Button>
                  </div>
                </div>
                {actionType === "transfer" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="agentId">Agent ID</Label>
                      <Input id="agentId" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Owner</Label>
                      <Input value={address ?? ""} disabled />
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={executeAction} disabled={!!executeStatus}>
                  {executeStatus ?? "Execute via 402"}
                </Button>
                {executeError && <p className="text-sm text-destructive">{executeError}</p>}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {riskNotes && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm whitespace-pre-wrap">
                    <p className="font-semibold">Risk preview (ChainGPT)</p>
                    <p className="text-muted-foreground">{riskNotes}</p>
                  </div>
                )}
                {(paymentDetailsDebug || witnessSignatureDebug) && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                    <p className="font-semibold">402 debug</p>
                    {paymentDetailsDebug && (
                      <>
                        <p className="mt-1 font-medium text-foreground/80">Payment details</p>
                        <pre className="text-muted-foreground whitespace-pre-wrap break-words rounded-md bg-background/50 p-2">
                          {paymentDetailsDebug}
                        </pre>
                      </>
                    )}
                    {witnessSignatureDebug && (
                      <>
                        <p className="mt-2 font-medium text-foreground/80">Witness signature</p>
                        <pre className="text-muted-foreground whitespace-pre-wrap break-words rounded-md bg-background/50 p-2 max-h-48 overflow-auto">
                          {witnessSignatureDebug}
                        </pre>
                      </>
                    )}
                  </div>
                )}
                {executeResult && (
                  <ExecutedResult hash={executeResult} network={network} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}

function ExecutedResult({ hash, network }: { hash: string; network: "testnet" | "mainnet" }) {
  const isTxHash = /^0x[a-fA-F0-9]{64}$/.test(hash);
  const explorerBase =
    network === "mainnet" ? "https://bscscan.com/tx/" : "https://testnet.bscscan.com/tx/";
  const explorerUrl = isTxHash ? `${explorerBase}${hash}` : undefined;

  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm">
      <p className="font-semibold">Executed</p>
      <div className="mt-1 space-y-2 text-xs">
        <div>
          <p className="font-medium text-foreground/80">Tx hash</p>
          <pre className="text-muted-foreground whitespace-pre-wrap break-all rounded-md bg-background/50 p-2">
            {hash}
          </pre>
        </div>
        {explorerUrl && (
          <a
            className="text-primary hover:underline"
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
          >
            View on BscScan
          </a>
        )}
      </div>
    </div>
  );
}
