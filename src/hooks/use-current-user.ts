"use client";

import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useAccount } from "wagmi";
import { convexClient } from "@/lib/convex/client";

export type UserPrefs = {
  network: "testnet" | "mainnet";
  txWarnings: boolean;
  allowDenyLists: boolean;
  telemetry: boolean;
  maxSpend: number;
};

export type UserProfile = {
  _id: Id<"users">;
  wallet: string;
  role: string;
  createdAt: number;
  prefs?: UserPrefs;
};

const convexAvailable = Boolean(convexClient);

export function useCurrentUser() {
  const { address, isConnected } = useAccount();

  if (!convexAvailable) {
    return {
      address: address ?? null,
      isConnected,
      user: null,
      isLoadingUser: false,
      convexConfigured: false,
    };
  }

  // Safe because ConvexProvider is only present when convexAvailable is true.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const user = useQuery(
    api.functions.users.getUserByWallet,
    address ? { wallet: address } : "skip"
  );

  const isLoadingUser = convexAvailable && isConnected && !!address && user === undefined;

  return {
    address: address ?? null,
    isConnected,
    user: (user ?? null) as UserProfile | null,
    isLoadingUser,
    convexConfigured: convexAvailable,
  };
}
