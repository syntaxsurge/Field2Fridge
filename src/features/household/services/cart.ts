export type PantryItem = {
  name: string;
  quantity: number;
  unit: string;
  avgDailyUse: number;
};

export type CartSuggestion = {
  name: string;
  suggestedQty: number;
  unit: string;
  reason: string;
  estimatedCost: number;
};

export function daysUntilEmpty(item: PantryItem) {
  if (item.avgDailyUse <= 0) return Infinity;
  return item.quantity / item.avgDailyUse;
}

export function buildCartSuggestions(items: PantryItem[]): CartSuggestion[] {
  const suggestions: CartSuggestion[] = [];
  items.forEach((item) => {
    const daysLeft = daysUntilEmpty(item);
    if (daysLeft <= 5) {
      const needed = Math.max(item.avgDailyUse * 7 - item.quantity, 0);
      suggestions.push({
        name: item.name,
        suggestedQty: Math.ceil(needed),
        unit: item.unit,
        reason: `Running out in ${daysLeft.toFixed(1)} days`,
        estimatedCost: Math.max(Math.ceil(needed) * 3, 5), // mock pricing
      });
    }
  });
  return suggestions;
}
