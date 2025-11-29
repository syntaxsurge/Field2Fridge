import {
  GenericMutationCtx,
  GenericQueryCtx,
  mutationGeneric,
  queryGeneric,
  type GenericDataModel,
} from "convex/server";
import { v } from "convex/values";

type MutationCtx = GenericMutationCtx<GenericDataModel>;
type QueryCtx = GenericQueryCtx<GenericDataModel>;

export const logAuditEvent = mutationGeneric({
  args: {
    userId: v.id("users"),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx: MutationCtx, args) => {
    const now = Date.now();
    return await ctx.db.insert("audit_logs", {
      userId: args.userId,
      type: args.type,
      payload: args.payload,
      createdAt: now,
    });
  },
});

export const listAuditEvents = queryGeneric({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("audit_logs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});
