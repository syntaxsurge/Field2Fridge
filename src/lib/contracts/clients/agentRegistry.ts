import { createPublicClient, http } from "viem";
import { bsc, bscTestnet } from "wagmi/chains";
import agentRegistryAbi from "../abi/Field2FridgeAgentRegistry.json";
import { CONTRACT_ADDRESSES } from "../addresses";

const transport = {
  [bscTestnet.id]: http("https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
  [bsc.id]: http("https://bsc-dataseed1.binance.org"),
} as const;

export function getAgentRegistryClient(chainId: number = bscTestnet.id) {
  const chain = chainId === bsc.id ? bsc : bscTestnet;
  return createPublicClient({ chain, transport: transport[chain.id] });
}

export async function fetchTokenUri(tokenId: bigint, chainId?: number) {
  const client = getAgentRegistryClient(chainId);
  return client.readContract({
    address: CONTRACT_ADDRESSES.bscTestnet
      .Field2FridgeAgentRegistry as `0x${string}`,
    abi: agentRegistryAbi,
    functionName: "tokenURI",
    args: [tokenId],
  }) as Promise<string>;
}
