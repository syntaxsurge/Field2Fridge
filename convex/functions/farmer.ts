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

export const saveSimulation = mutationGeneric({
  args: {
    userId: v.id("users"),
    crop: v.string(),
    region: v.string(),
    fieldSizeHa: v.number(),
    result: v.object({
      variety: v.string(),
      expectedYieldTPerHa: v.number(),
      traitScore: v.number(),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx: MutationCtx, args) => {
    const payload: {
      userId: GenericId<"users">;
      crop: string;
      region: string;
      fieldSizeHa: number;
      variety: string;
      expectedYieldTPerHa: number;
      traitScore: number;
      requestedAt: number;
      notes?: string;
    } = {
      userId: args.userId,
      crop: args.crop,
      region: args.region,
      fieldSizeHa: args.fieldSizeHa,
      variety: args.result.variety,
      expectedYieldTPerHa: args.result.expectedYieldTPerHa,
      traitScore: args.result.traitScore,
      requestedAt: Date.now(),
    };
    if (args.result.notes !== undefined) {
      payload.notes = args.result.notes;
    }
    return await ctx.db.insert("farmer_simulations", payload);
  },
});

export const latestSimulation = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("farmer_simulations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

export const listSimulations = queryGeneric({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args) => {
    const limit = args.limit ?? 25;
    return await ctx.db
      .query("farmer_simulations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
