"use client";

import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useMemo } from "react";
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

  const user = convexConfigured && address
    ? useQuery(api.functions.users.getUserByWallet, { wallet: address })
    : undefined;

  const isLoadingUser = useMemo(
    () => convexConfigured && isConnected && !!address && user === undefined,
    [address, isConnected, user]
  );

  return {
    address: address ?? null,
    isConnected,
    user: (user ?? null) as UserProfile | null,
    isLoadingUser,
    convexConfigured,
  };
}
