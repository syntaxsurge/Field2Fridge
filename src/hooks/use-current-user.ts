"use client";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useAccount } from "wagmi";

export type UserProfile = {
  _id: Id<"users">;
  wallet: string;
  role: string;
  createdAt: number;
  prefs?: unknown;
};

const convexConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function useCurrentUser() {
  const { address, isConnected } = useAccount();

  if (!convexConfigured) {
    return {
      address: address ?? null,
      isConnected,
      user: null,
      isLoadingUser: false,
      convexConfigured,
    };
  }

  // Safe because ConvexProvider is only present when convexConfigured is true.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const user = useQuery(
    api.functions.users.getUserByWallet,
    address ? { wallet: address } : "skip"
  );

  const isLoadingUser = convexConfigured && isConnected && !!address && user === undefined;

  return {
    address: address ?? null,
    isConnected,
    user: (user ?? null) as UserProfile | null,
    isLoadingUser,
    convexConfigured,
  };
}
