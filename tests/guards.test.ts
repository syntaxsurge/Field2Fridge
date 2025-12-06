import { assertWithinPerOrderCap, enforceMaxSpend } from "@/lib/guards/spend";
import { buildCartSuggestions, summarizeCart } from "@/features/household/services/cart";

describe("spend guardrails", () => {
  it("allows totals inside per-order cap", () => {
    expect(() => assertWithinPerOrderCap(25, 60)).not.toThrow();
  });

  it("throws when exceeding per-order cap", () => {
    expect(() => assertWithinPerOrderCap(75, 60)).toThrow(/exceeds/);
  });

  it("throws when exceeding global max spend", () => {
    expect(() => enforceMaxSpend(101, 100)).toThrow(/global max/);
  });
});

describe("cart suggestions", () => {
  it("creates suggestions for items running out", () => {
    const suggestions = buildCartSuggestions([
      { name: "Milk", quantity: 1, unit: "gal", avgDailyUse: 0.5 },
      { name: "Rice", quantity: 5, unit: "lb", avgDailyUse: 1 },
    ]);
    expect(suggestions.length).toBeGreaterThan(0);
    const summary = summarizeCart(suggestions);
    expect(summary.count).toBe(suggestions.length);
    expect(summary.total).toBeGreaterThan(0);
  });
});
