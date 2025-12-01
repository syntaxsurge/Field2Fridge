import {
  GenericMutationCtx,
  GenericQueryCtx,
  mutationGeneric,
  queryGeneric,
  type GenericDataModel,
} from "convex/server";
import { GenericId, v } from "convex/values";

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

export const upsertPantryItem = mutationGeneric({
  args: {
    userId: v.id("users"),
    id: v.optional(v.id("pantry_items")),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    avgDailyUse: v.number(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    const normalizedName = args.name.trim();
    const normalizedUnit = args.unit.trim() || "pcs";
    const normalizedAvgDailyUse = Number.isFinite(args.avgDailyUse)
      ? Math.max(args.avgDailyUse, 0)
      : 0;

    if (args.id) {
      const existingById = await ctx.db.get(args.id);
      if (!existingById) {
        throw new Error("Pantry item not found.");
      }
      if (existingById.userId !== args.userId) {
        throw new Error("You can only edit your own pantry items.");
      }
      await ctx.db.patch(args.id, {
        name: normalizedName,
        quantity: args.quantity,
        unit: normalizedUnit,
        avgDailyUse: normalizedAvgDailyUse,
        lastUpdated: now,
      });
      return args.id;
    }

    const existing = (await ctx.db
      .query("pantry_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()) as PantryRow[];

    const match = existing.find(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase() === normalizedName.toLowerCase()
    );

    if (match) {
      await ctx.db.patch(match._id, {
        name: normalizedName,
        quantity: args.quantity,
        unit: normalizedUnit,
        avgDailyUse: normalizedAvgDailyUse,
        lastUpdated: now,
      });
      return match._id;
    }

    return await ctx.db.insert("pantry_items", {
      userId: args.userId,
      name: normalizedName,
      quantity: args.quantity,
      unit: normalizedUnit,
      avgDailyUse: normalizedAvgDailyUse,
      lastUpdated: now,
    });
  },
});

export const getPantryItems = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("pantry_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
