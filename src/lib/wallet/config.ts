import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

const chains = [bscTestnet, bsc] as const;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  { appName: "Field2Fridge", projectId: walletConnectProjectId }
);

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
    [bsc.id]: http("https://bsc-dataseed1.binance.org"),
  },
  ssr: true,
});

export const supportedChains = chains;
export const defaultChain = bscTestnet;
export const walletProjectId = walletConnectProjectId;
