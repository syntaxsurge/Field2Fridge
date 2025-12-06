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
    riskScore: v.optional(v.number()),
    climate: v.optional(
      v.object({
        meanTempC: v.number(),
        totalRainfallMm: v.number(),
        meanSolarKwhM2: v.number(),
        droughtDays: v.number(),
        periodStart: v.string(),
        periodEnd: v.string(),
        latitude: v.number(),
        longitude: v.number(),
      })
    ),
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
      riskScore?: number;
      meanTempC?: number;
      totalRainfallMm?: number;
      meanSolarKwhM2?: number;
      droughtDays?: number;
      periodStart?: string;
      periodEnd?: string;
      latitude?: number;
      longitude?: number;
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
    if (args.riskScore !== undefined) {
      payload.riskScore = args.riskScore;
    }
    if (args.climate) {
      payload.meanTempC = args.climate.meanTempC;
      payload.totalRainfallMm = args.climate.totalRainfallMm;
      payload.meanSolarKwhM2 = args.climate.meanSolarKwhM2;
      payload.droughtDays = args.climate.droughtDays;
      payload.periodStart = args.climate.periodStart;
      payload.periodEnd = args.climate.periodEnd;
      payload.latitude = args.climate.latitude;
      payload.longitude = args.climate.longitude;
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
