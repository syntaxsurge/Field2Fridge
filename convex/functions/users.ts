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

async function ensureHouseholdSettings(
  ctx: MutationCtx,
  userId: GenericId<"users">,
) {
  const existingSettings = await ctx.db
    .query("household_settings")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!existingSettings) {
    await ctx.db.insert("household_settings", {
      userId,
      ...DEFAULT_HOUSEHOLD_SETTINGS,
      updatedAt: Date.now(),
    });
  }
}

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
    network: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("wallet", args.wallet))
      .unique();

    const now = Date.now();
    const network = args.network ?? "bsc-testnet";

    if (existing) {
      await ctx.db.patch(existing._id as GenericId<"users">, {
        role: args.role,
        ...(args.prefs ? { prefs: args.prefs } : {}),
        network,
      });
      if (args.role === "household") {
        await ensureHouseholdSettings(ctx, existing._id as GenericId<"users">);
      }
      return existing._id;
    }

    const id = await ctx.db.insert("users", {
      wallet: args.wallet,
      role: args.role,
      createdAt: now,
      network,
      ...(args.prefs ? { prefs: args.prefs } : {}),
    });
    if (args.role === "household") {
      await ensureHouseholdSettings(ctx, id as GenericId<"users">);
    }
    return id;
  },
});

export const updatePrefs = mutationGeneric({
  args: {
    userId: v.id("users"),
    prefs: v.object({
      network: v.union(v.literal("testnet"), v.literal("mainnet")),
      txWarnings: v.boolean(),
      allowDenyLists: v.boolean(),
      telemetry: v.boolean(),
      maxSpend: v.number(),
      maxOnchainUsd: v.number(),
      allowedContracts: v.array(v.string()),
      blockedContracts: v.array(v.string()),
    }),
  },
  handler: async (ctx: MutationCtx, args) => {
    await ctx.db.patch(args.userId as GenericId<"users">, { prefs: args.prefs });
  },
});
