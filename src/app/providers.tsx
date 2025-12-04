"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { ConvexProvider } from "convex/react";
import { convexClient } from "@/lib/convex/client";
import { WagmiProvider, type Config as WagmiConfig, createConfig, http } from "wagmi";
import type { Chain } from "wagmi/chains";
import { bsc, bscTestnet } from "wagmi/chains";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState<WagmiConfig>();
  const [defaultChain, setDefaultChain] = useState<Chain>();

  const fallbackConfig = createConfig({
    chains: [bscTestnet, bsc],
    connectors: [],
    transports: {
      [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
      [bsc.id]: http("https://bsc-dataseed1.binance.org"),
    },
    ssr: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("@/lib/wallet/config");
      if (mounted) {
        setWagmiConfig(mod.wagmiConfig);
        setDefaultChain(mod.defaultChain);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const resolvedConfig = wagmiConfig ?? fallbackConfig;
  const resolvedChain = defaultChain ?? bscTestnet;

  return (
    <WagmiProvider config={resolvedConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          initialChain={resolvedChain}
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
