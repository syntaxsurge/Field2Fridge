import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    wallet: v.string(),
    role: v.string(), // "household" | "farmer" | "both"
    createdAt: v.number(),
  }).index("by_wallet", ["wallet"]),
  pantry_items: defineTable({
    userId: v.id("users"),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
  audit_logs: defineTable({
    userId: v.id("users"),
    type: v.string(),
    payload: v.any(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
