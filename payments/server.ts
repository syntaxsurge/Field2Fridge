import dotenv from "dotenv";
import express from "express";
import { createPublicClient, createWalletClient, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createQ402Middleware } = require("q402/packages/middleware-express/src");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SupportedNetworks } = require("q402/packages/core/src/types/network");

declare global {
  namespace Express {
    interface Request {
      payment?: {
        verified: boolean;
        payer: string;
        amount: string;
        token: string;
      };
    }
  }
}

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.Q402_PORT ? Number(process.env.Q402_PORT) : 4020;
const rpcUrl = process.env.Q402_RPC_URL ?? "https://bsc-testnet.publicnode.com";
const signerPk = process.env.Q402_SIGNER_PRIVATE_KEY;
const tokenAddress = process.env.Q402_TOKEN_ADDRESS ?? process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS;
const implementationContract =
  process.env.Q402_IMPLEMENTATION_CONTRACT ?? process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS;
const verifyingContract = process.env.Q402_VERIFYING_CONTRACT ?? implementationContract;
const recipient = process.env.Q402_RECIPIENT_ADDRESS ?? process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS;
const network =
  process.env.Q402_NETWORK === "bsc-mainnet" ? SupportedNetworks.BSC_MAINNET : SupportedNetworks.BSC_TESTNET;

if (!signerPk) {
  console.warn("Q402_SIGNER_PRIVATE_KEY missing; gateway will still start but cannot settle payments.");
}

const chain = network === SupportedNetworks.BSC_MAINNET ? bsc : bscTestnet;
const walletClient = signerPk
  ? createWalletClient({
      account: privateKeyToAccount(signerPk as `0x${string}`),
      chain,
      transport: http(rpcUrl),
    })
  : undefined;

const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

const middleware = createQ402Middleware({
  network,
  recipientAddress: (recipient as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
  implementationContract: (implementationContract as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
  verifyingContract: (verifyingContract as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
  walletClient: walletClient ?? ({} as any),
  endpoints: [
    {
      path: "/api/execute",
      amount: "1000000000000000", // 0.001 token units
      token: (tokenAddress as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
      description: "Execute on-chain action via Field2Fridge gateway",
    },
  ],
  autoSettle: false,
});

app.use(middleware);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/execute", async (req, res) => {
  if (!req.payment || !req.payment.verified) {
    return res.status(402).json({ error: "Payment verification required" });
  }

  const { tx } = req.body as { tx?: { to?: string; data?: string; value?: string | number | bigint } };
  if (!tx?.to || !tx?.data) {
    return res.status(400).json({ error: "Missing tx payload" });
  }

  if (!walletClient) {
    return res.status(500).json({ error: "Gateway signer not configured" });
  }

  try {
    const hash = await walletClient.sendTransaction({
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
      value: tx.value ? BigInt(tx.value) : 0n,
      account: walletClient.account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    res.json({
      ok: true,
      txHash: hash,
      blockNumber: receipt.blockNumber?.toString(),
      payer: req.payment.payer,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Q402 gateway running on http://localhost:${PORT}`);
});
