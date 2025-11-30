import {
  GenericMutationCtx,
  mutationGeneric,
  type GenericDataModel,
} from "convex/server";
import { v } from "convex/values";

type MutationCtx = GenericMutationCtx<GenericDataModel>;

const RESET_TOKEN = process.env.CONVEX_RESET_TOKEN;
const TABLES = ["users", "pantry_items", "audit_logs", "household_settings", "cart_events", "farmer_simulations"] as const;

export const truncateAll = mutationGeneric({
  args: {
    secret: v.optional(v.string()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args) => {
    if (RESET_TOKEN && args.secret !== RESET_TOKEN) {
      throw new Error("Invalid reset token.");
    }

    const batchSize = args.batchSize ?? 128;
    const result: Record<string, number> = {};

    for (const table of TABLES) {
      let deleted = 0;
      // Delete in batches to avoid timeouts on large datasets.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const rows = await ctx.db.query(table as any).take(batchSize);
        if (rows.length === 0) break;
        for (const row of rows) {
          await ctx.db.delete(row._id as any);
          deleted += 1;
        }
      }
      result[table] = deleted;
    }

    return result;
  },
});
