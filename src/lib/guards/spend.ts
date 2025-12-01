/**
 * Shared guardrail helpers to keep premium actions inside user-defined limits.
 */
export function assertWithinPerOrderCap(totalUsd: number, capUsd?: number, label?: string) {
  if (capUsd && totalUsd > capUsd) {
    const name = label ?? "per-order cap";
    throw new Error(
      `Price $${totalUsd.toFixed(2)} exceeds ${name} of $${capUsd.toFixed(2)}. Update Safety settings to proceed.`,
    );
  }
}

export function enforceMaxSpend(totalUsd: number, maxUsd?: number) {
  if (maxUsd && totalUsd > maxUsd) {
    throw new Error(
      `Price $${totalUsd.toFixed(2)} exceeds your global max spend of $${maxUsd.toFixed(
        2,
      )}. Lower cost or raise the limit in Settings.`,
    );
  }
}

export function ensureVendorAllowed(vendors: Record<string, boolean>, vendor: string | null | undefined) {
  if (!vendor) {
    throw new Error("No allowed vendors are configured. Enable at least one in Safety & Controls.");
  }
  if (!vendors[vendor]) {
    throw new Error(`${vendor} is blocked by your allow/deny list. Choose an allowed vendor before continuing.`);
  }
}
