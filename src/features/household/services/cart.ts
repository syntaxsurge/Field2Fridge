export type PantryItem = {
  name: string;
  quantity: number;
  unit: string;
  avgDailyUse?: number;
};

export type HouseholdSettings = {
  weeklyBudget: number;
  perOrderCap: number;
  approvalMode: "ask" | "auto";
  vendors: Record<string, boolean>;
};

export type CartSuggestion = {
  name: string;
  suggestedQty: number;
  unit: string;
  reason: string;
  estimatedCost: number;
};

export function daysUntilEmpty(item: PantryItem) {
  if (!item.avgDailyUse || item.avgDailyUse <= 0) return Infinity;
  return item.quantity / item.avgDailyUse;
}

export function buildCartSuggestions(items: PantryItem[]): CartSuggestion[] {
  const suggestions: CartSuggestion[] = [];
  items.forEach((item) => {
    const daysLeft = daysUntilEmpty(item);
    if (daysLeft <= 5) {
      const needed = Math.max((item.avgDailyUse ?? 0) * 7 - item.quantity, 0);
      suggestions.push({
        name: item.name,
        suggestedQty: Math.max(Math.ceil(needed), 1),
        unit: item.unit,
        reason: `Running out in ${daysLeft.toFixed(1)} days`,
        estimatedCost: Math.max(Math.ceil(needed || 1) * 4, 5),
      });
    }
  });
  return suggestions;
}

export function chooseVendor(settings: HouseholdSettings) {
  return Object.entries(settings.vendors).find(([, allowed]) => allowed)?.[0] ?? null;
}

export function summarizeCart(suggestions: CartSuggestion[]) {
  const total = suggestions.reduce((sum, item) => sum + item.estimatedCost, 0);
  const count = suggestions.length;
  return { total, count };
}
