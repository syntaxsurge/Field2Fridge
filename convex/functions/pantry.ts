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
  lastUpdated: number;
};

export const upsertPantryItem = mutationGeneric({
  args: {
    userId: v.id("users"),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const existing = (await ctx.db
      .query("pantry_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()) as PantryRow[];

    const match = existing.find(
      (item) =>
        typeof item.name === "string" &&
        item.name.toLowerCase() === args.name.toLowerCase()
    );

    const now = Date.now();

    if (match) {
      await ctx.db.patch(match._id, {
        quantity: args.quantity,
        unit: args.unit,
        lastUpdated: now,
      });
      return match._id;
    }

    return await ctx.db.insert("pantry_items", {
      userId: args.userId,
      name: args.name,
      quantity: args.quantity,
      unit: args.unit,
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
