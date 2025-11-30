"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { ConvexProvider } from "convex/react";
import { convexClient } from "@/lib/convex/client";
import { ThemeProvider } from "next-themes";
import { WagmiProvider, type State } from "wagmi";
import { defaultChain, wagmiConfig } from "@/lib/wallet/config";

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {mounted && (
            <RainbowKitProvider
              modalSize="compact"
              initialChain={defaultChain}
              theme={{
                lightMode: lightTheme({ borderRadius: "large", overlayBlur: "small" }),
                darkMode: darkTheme({ borderRadius: "large", overlayBlur: "small" }),
              }}
            >
              {convexClient ? <ConvexProvider client={convexClient}>{children}</ConvexProvider> : children}
            </RainbowKitProvider>
          )}
          {!mounted && children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
