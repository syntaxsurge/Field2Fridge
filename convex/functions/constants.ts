export const DEFAULT_HOUSEHOLD_SETTINGS = {
  weeklyBudget: 80,
  perOrderCap: 60,
  approvalMode: "ask" as const,
  vendors: {
    "Local Co-op": true,
    Amazon: true,
    Walmart: false,
  },
};
