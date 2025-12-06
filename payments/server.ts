// Ensure BigInt values serialize cleanly in JSON responses
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

import dotenv from "dotenv";
import express from "express";
import { createPublicClient, createWalletClient, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.Q402_PORT ?? 4020);
const rpcUrl = process.env.Q402_RPC_URL ?? "https://bsc-testnet.publicnode.com";
const signerPk = process.env.Q402_SIGNER_PRIVATE_KEY as `0x${string}` | undefined;
const network = process.env.Q402_NETWORK === "bsc-mainnet" ? "BSC_MAINNET" : "BSC_TESTNET";
const chain = network === "BSC_MAINNET" ? bsc : bscTestnet;

console.log("[402-demo] network:", network);
console.log("[402-demo] rpcUrl:", rpcUrl);
console.log("[402-demo] signerPk present:", !!signerPk);

const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

const walletClient = signerPk
  ? createWalletClient({
      chain,
      transport: http(rpcUrl),
      account: privateKeyToAccount(signerPk),
    })
  : undefined;

if (!walletClient) {
  console.warn("[402-demo] WARNING: Q402_SIGNER_PRIVATE_KEY not set; will not send real txs");
}

const tokenAddress = process.env.Q402_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS;
const recipientAddress = process.env.Q402_RECIPIENT_ADDRESS || process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Minimal 402-style flow:
// First call (no X-PAYMENT): respond 402 + payment details
// Second call (with X-PAYMENT): log header and (optionally) send tx
app.post("/api/execute", async (req, res) => {
  try {
    const xPayment = req.header("X-PAYMENT");
    const tx = req.body?.tx as
      | {
          to?: string;
          data?: string;
          value?: string | number | bigint | null;
        }
      | undefined;

    if (!tx?.to || !tx?.data) {
      console.error("[402-demo] Missing tx.to or tx.data", tx);
      return res.status(400).json({ error: "Missing tx.to or tx.data" });
    }

    if (!xPayment) {
      console.log("[402-demo] No X-PAYMENT header; returning 402");
      const nowSec = Math.floor(Date.now() / 1000);
      const deadlineSec = nowSec + 60 * 60; // 1h
      const paymentDetails = {
        scheme: "evm/eip712-witness-demo",
        networkId: network === "BSC_MAINNET" ? "bsc-mainnet" : "bsc-testnet",
        token: tokenAddress,
        amount: "1000000000000000", // 0.001
        to: recipientAddress,
        implementationContract: recipientAddress,
        witness: {
          domain: {
            name: "F2F-402",
            version: "1",
            chainId: chain.id,
            verifyingContract: recipientAddress,
          },
          types: {
            Witness: [
              { name: "owner", type: "address" },
              { name: "token", type: "address" },
              { name: "amount", type: "uint256" },
              { name: "to", type: "address" },
              { name: "deadline", type: "uint256" },
              { name: "paymentId", type: "bytes32" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "Witness",
          message: {
            owner: "0x0000000000000000000000000000000000000000",
            token: tokenAddress,
            amount: "1000000000000000",
            to: recipientAddress,
            deadline: String(deadlineSec),
            paymentId: "0x0000000000000000000000000000000000000000000000000000000000000000",
            nonce: "0",
          },
        },
      };
      return res.status(402).json(paymentDetails);
    }

    console.log("[402-demo] X-PAYMENT header received:", xPayment);

    if (!walletClient) {
      console.warn("[402-demo] No signer in gateway; simulating success");
      return res.json({ ok: true, txHash: "0xSIMULATED" });
    }

    const valueBigInt = tx.value == null ? 0n : BigInt(tx.value as string | number | bigint);
    console.log("[402-demo] Sending tx:", {
      to: tx.to,
      data: tx.data,
      value: valueBigInt.toString(),
    });

    const hash = await walletClient.sendTransaction({
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
      value: valueBigInt,
    });

    console.log("[402-demo] Sent tx; hash:", hash);
    return res.json({ ok: true, txHash: hash });
  } catch (err: any) {
    console.error("[402-demo] ERROR in /api/execute", err);
    return res.status(500).json({
      error: "Internal server error in gateway",
      details: String(err?.message ?? err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`402 demo gateway running on http://localhost:${PORT}`);
});
