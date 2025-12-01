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

export const recordMemory = mutationGeneric({
  args: {
    userId: v.id("users"),
    snapshot: v.any(),
    source: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    return await ctx.db.insert("agent_memories", {
      userId: args.userId as GenericId<"users">,
      snapshot: args.snapshot,
      createdAt: Date.now(),
      ...(args.source ? { source: args.source } : {}),
    });
  },
});

export const listMemories = queryGeneric({
  args: { userId: v.id("users") },
  handler: async (ctx: QueryCtx, args) => {
    return await ctx.db
      .query("agent_memories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as GenericId<"users">))
      .order("desc")
      .take(20);
  },
});
