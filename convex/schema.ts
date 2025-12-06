import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    wallet: v.string(),
    role: v.string(), // "household" | "farmer" | "both"
    createdAt: v.number(),
    prefs: v.optional(v.any()),
    network: v.optional(v.string()),
  }).index("by_wallet", ["wallet"]),
  pantry_items: defineTable({
    userId: v.id("users"),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    avgDailyUse: v.optional(v.number()),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
  household_settings: defineTable({
    userId: v.id("users"),
    weeklyBudget: v.number(),
    perOrderCap: v.number(),
    approvalMode: v.union(v.literal("ask"), v.literal("auto")),
    vendors: v.record(v.string(), v.boolean()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  cart_events: defineTable({
    userId: v.id("users"),
    decision: v.union(v.literal("approved"), v.literal("declined")),
    vendor: v.optional(v.string()),
    fulfillmentStatus: v.optional(v.string()),
    items: v.array(
      v.object({
        name: v.string(),
        suggestedQty: v.number(),
        unit: v.string(),
        reason: v.string(),
        estimatedCost: v.number(),
      })
    ),
    total: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  farmer_simulations: defineTable({
    userId: v.id("users"),
    crop: v.string(),
    region: v.string(),
    fieldSizeHa: v.number(),
    variety: v.string(),
    expectedYieldTPerHa: v.number(),
    traitScore: v.number(),
    notes: v.optional(v.string()),
    riskScore: v.optional(v.number()),
    meanTempC: v.optional(v.number()),
    totalRainfallMm: v.optional(v.number()),
    meanSolarKwhM2: v.optional(v.number()),
    droughtDays: v.optional(v.number()),
    periodStart: v.optional(v.string()),
    periodEnd: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    requestedAt: v.number(),
  }).index("by_user", ["userId"]),
  audit_logs: defineTable({
    userId: v.id("users"),
    type: v.string(),
    payload: v.any(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  agent_memories: defineTable({
    userId: v.id("users"),
    snapshot: v.any(),
    source: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
