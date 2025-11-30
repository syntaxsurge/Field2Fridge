import {
  GenericMutationCtx,
  GenericQueryCtx,
  mutationGeneric,
  queryGeneric,
  type GenericDataModel,
} from "convex/server";
import { GenericId, v } from "convex/values";
import { DEFAULT_HOUSEHOLD_SETTINGS } from "./constants";

type MutationCtx = GenericMutationCtx<GenericDataModel>;
type QueryCtx = GenericQueryCtx<GenericDataModel>;

type PantryRow = {
  _id: GenericId<"pantry_items">;
  userId: GenericId<"users">;
  name: string | null;
  quantity: number;
  unit: string;
  avgDailyUse?: number | null;
  lastUpdated: number;
};

type HouseholdSettingsDoc = {
  _id?: GenericId<"household_settings">;
  userId: GenericId<"users">;
  weeklyBudget: number;
  perOrderCap: number;
  approvalMode: "ask" | "auto";
  vendors: Record<string, boolean>;
  updatedAt: number;
};

type CartEvent = {
  _id: GenericId<"cart_events">;
  userId: GenericId<"users">;
  decision: "approved" | "declined";
  items: CartSuggestion[];
  total: number;
  createdAt: number;
};

type CartSuggestion = {
  name: string;
  suggestedQty: number;
  unit: string;
  reason: string;
  estimatedCost: number;
};

function daysUntilEmpty(item: PantryRow) {
  if (!item.avgDailyUse || item.avgDailyUse <= 0) return Infinity;
  return item.quantity / item.avgDailyUse;
}

function buildCartSuggestions(items: PantryRow[]): CartSuggestion[] {
  const suggestions: CartSuggestion[] = [];
  items.forEach((item) => {
    const daysLeft = daysUntilEmpty(item);
    if (daysLeft <= 5) {
      const needed = Math.max((item.avgDailyUse ?? 0) * 7 - item.quantity, 0);
      const suggestedQty = Math.max(Math.ceil(needed), 1);
      suggestions.push({
        name: item.name ?? "Unknown item",
        suggestedQty,
        unit: item.unit,
        reason: `Running out in ${daysLeft.toFixed(1)} days`,
        estimatedCost: Math.max(suggestedQty * 4, 5),
      });
    }
  });
  return suggestions;
}

async function getSettings(
  ctx: QueryCtx | MutationCtx,
  userId: GenericId<"users">
): Promise<HouseholdSettingsDoc | null> {
  const doc = await ctx.db
    .query("household_settings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return (doc as HouseholdSettingsDoc | null) ?? null;
}

export const fetchSettings = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await getSettings(ctx, args.userId);
  },
});

export const saveSettings = mutationGeneric({
  args: {
    userId: v.id("users"),
    weeklyBudget: v.number(),
    perOrderCap: v.number(),
    approvalMode: v.union(v.literal("ask"), v.literal("auto")),
    vendors: v.record(v.string(), v.boolean()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const existing = await getSettings(ctx, args.userId);
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id as GenericId<"household_settings">, payload);
      return existing._id;
    }
    return await ctx.db.insert("household_settings", payload);
  },
});

export const overview = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    const [settings, pantry, cartEvents] = await Promise.all([
      getSettings(ctx, args.userId),
      ctx.db
        .query("pantry_items")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect() as Promise<PantryRow[]>,
      ctx.db
        .query("cart_events")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(100) as Promise<CartEvent[]>,
    ]);

    const effectiveSettings: HouseholdSettingsDoc =
      settings ??
      ({
        ...DEFAULT_HOUSEHOLD_SETTINGS,
        userId: args.userId,
        updatedAt: Date.now(),
      } as HouseholdSettingsDoc);

    const riskyItems = pantry.filter((item) => daysUntilEmpty(item) <= 7);
    const suggestions = buildCartSuggestions(pantry);
    const total = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0);
    const vendor =
      Object.entries(effectiveSettings.vendors).find(([, allowed]) => allowed)?.[0] ?? null;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const spentThisWeek = cartEvents
      .filter((event) => event.createdAt >= sevenDaysAgo && event.decision === "approved")
      .reduce((sum, event) => sum + event.total, 0);

    return {
      riskyCount: riskyItems.length,
      riskyNames: riskyItems.map((i) => i.name ?? "Unknown"),
      weeklyBudget: effectiveSettings.weeklyBudget,
      perOrderCap: effectiveSettings.perOrderCap,
      approvalMode: effectiveSettings.approvalMode,
      spentThisWeek,
      vendors: effectiveSettings.vendors,
      upcomingCart:
        suggestions.length === 0
          ? null
          : {
              vendor,
              total,
              autoApproveUnder:
                effectiveSettings.approvalMode === "auto"
                  ? effectiveSettings.perOrderCap
                  : null,
              suggestions,
            },
    };
  },
});

export const getCartSuggestions = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    const [settings, pantry] = await Promise.all([
      getSettings(ctx, args.userId),
      ctx.db
        .query("pantry_items")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect() as Promise<PantryRow[]>,
    ]);

    const effectiveSettings: HouseholdSettingsDoc =
      settings ??
      ({
        ...DEFAULT_HOUSEHOLD_SETTINGS,
        userId: args.userId,
        updatedAt: Date.now(),
      } as HouseholdSettingsDoc);

    const suggestions = buildCartSuggestions(pantry);
    const total = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0);
    const vendor =
      Object.entries(effectiveSettings.vendors).find(([, allowed]) => allowed)?.[0] ?? null;

    return {
      suggestions,
      total,
      vendor,
      perOrderCap: effectiveSettings.perOrderCap,
      approvalMode: effectiveSettings.approvalMode,
    };
  },
});

export const recordCartDecision = mutationGeneric({
  args: {
    userId: v.id("users"),
    decision: v.union(v.literal("approved"), v.literal("declined")),
    cart: v.array(
      v.object({
        name: v.string(),
        suggestedQty: v.number(),
        unit: v.string(),
        reason: v.string(),
        estimatedCost: v.number(),
      })
    ),
  },
  handler: async (ctx: MutationCtx, args) => {
    const settings = await getSettings(ctx, args.userId);
    const total = args.cart.reduce((sum, item) => sum + item.estimatedCost, 0);

    if (args.decision === "approved" && settings && total > settings.perOrderCap) {
      throw new Error(
        `Cart total $${total.toFixed(
          2
        )} exceeds per-order cap of $${settings.perOrderCap.toFixed(2)}`
      );
    }

    await ctx.db.insert("cart_events", {
      userId: args.userId,
      decision: args.decision,
      items: args.cart,
      total,
      createdAt: Date.now(),
    });

    await ctx.db.insert("audit_logs", {
      userId: args.userId,
      type: "cart_decision",
      payload: { decision: args.decision, total, count: args.cart.length },
      createdAt: Date.now(),
    });
  },
});

export const listCartEvents = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("cart_events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(25);
  },
});
