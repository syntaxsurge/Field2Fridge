/**
 * Builds an x-payment header compatible with the local 402 gateway.
 * Uses the sponsor secret on the server side so we never leak it to the client.
 */
export function buildPaymentHeader() {
  const secret = process.env.Q402_SPONSOR_SECRET;
  if (!secret) {
    throw new Error("Q402_SPONSOR_SECRET is not configured");
  }
  // The gateway validates the raw secret via timingSafeEqual.
  return secret;
}
