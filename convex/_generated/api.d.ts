/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_admin from "../functions/admin.js";
import type * as functions_audit from "../functions/audit.js";
import type * as functions_constants from "../functions/constants.js";
import type * as functions_farmer from "../functions/farmer.js";
import type * as functions_household from "../functions/household.js";
import type * as functions_pantry from "../functions/pantry.js";
import type * as functions_users from "../functions/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/admin": typeof functions_admin;
  "functions/audit": typeof functions_audit;
  "functions/constants": typeof functions_constants;
  "functions/farmer": typeof functions_farmer;
  "functions/household": typeof functions_household;
  "functions/pantry": typeof functions_pantry;
  "functions/users": typeof functions_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
