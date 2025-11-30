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

export const getUserByWallet = queryGeneric({
  args: { wallet: v.string() },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();
  },
});

export const createOrUpdateUser = mutationGeneric({
  args: {
    wallet: v.string(),
    role: v.string(), // "household" | "farmer" | "both"
    prefs: v.optional(v.any()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id as GenericId<"users">, {
        role: args.role,
        ...(args.prefs ? { prefs: args.prefs } : {}),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      wallet: args.wallet,
      role: args.role,
      createdAt: now,
      ...(args.prefs ? { prefs: args.prefs } : {}),
    });
  },
});
