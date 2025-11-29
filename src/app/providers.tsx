"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";

import { convexClient } from "@/lib/convex/client";
import { defaultChain, wagmiConfig } from "@/lib/wallet/config";
import { ConvexProvider } from "convex/react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={defaultChain}
          theme={{
            lightMode: lightTheme({ borderRadius: "large", overlayBlur: "small" }),
            darkMode: darkTheme({ borderRadius: "large", overlayBlur: "small" }),
          }}
        >
          {convexClient ? (
            <ConvexProvider client={convexClient}>{children}</ConvexProvider>
          ) : (
            children
          )}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
