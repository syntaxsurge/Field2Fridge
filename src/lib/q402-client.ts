/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
// Thin client-side bridge to the q402 monorepo. Uses CommonJS require to avoid TS conflicts.
const core = require("q402/packages/core/src");

export type PaymentRequiredResponse = {
  x402Version: number;
  accepts: Array<Record<string, any>>;
  error?: string;
};

export const createPaymentHeaderWithWallet = core.createPaymentHeaderWithWallet as (
  walletClient: any,
  paymentDetails: Record<string, any>,
) => Promise<string>;

export const selectPaymentDetails = core.selectPaymentDetails as (
  response: PaymentRequiredResponse,
  options?: { network?: string; scheme?: string; maxAmount?: bigint },
) => Record<string, any> | null;
