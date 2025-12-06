/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
// Thin client-side bridge to the q402 monorepo. Uses CommonJS require to avoid TS conflicts.
// The @q402/* symlinks are created by scripts/link-q402.js (postinstall).
let core: any;
try {
  core = require("@q402/core");
} catch (err) {
  // Fallback to monorepo path if symlink missing
  core = require("q402/packages/core/dist");
}

export type PaymentRequiredResponse = {
  x402Version: number;
  accepts: Array<Record<string, any>>;
  error?: string;
};

function assertReady(fn: any, name: string) {
  if (typeof fn !== "function") {
    throw new Error(
      `q402 client is not linked correctly: missing ${name}. Run ` +
        "`pnpm link:q402` and reinstall dependencies."
    );
  }
  return fn;
}

export const createPaymentHeaderWithWallet = assertReady(core.createPaymentHeaderWithWallet, "createPaymentHeaderWithWallet") as (
  walletClient: any,
  paymentDetails: Record<string, any>,
) => Promise<string>;

export const createPaymentHeader = assertReady(core.createPaymentHeader, "createPaymentHeader") as (
  account: any,
  paymentDetails: Record<string, any>,
) => Promise<string>;

export const selectPaymentDetails = assertReady(core.selectPaymentDetails, "selectPaymentDetails") as (
  response: PaymentRequiredResponse,
  options?: { network?: string; scheme?: string; maxAmount?: bigint },
) => Record<string, any> | null;
