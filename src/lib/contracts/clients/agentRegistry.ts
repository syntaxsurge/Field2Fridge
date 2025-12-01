import { createPublicClient, createWalletClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import agentRegistryAbi from "../abi/Field2FridgeAgentRegistry.json";
import { CONTRACT_ADDRESSES } from "../addresses";

export const agentRegistryAddress = CONTRACT_ADDRESSES.bscTestnet.Field2FridgeAgentRegistry as `0x${string}`;

export const publicAgentRegistryClient = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.BSC_TESTNET_RPC_URL),
});

export function createAgentRegistryWalletClient(account: `0x${string}`) {
  return createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(process.env.BSC_TESTNET_RPC_URL),
  });
}

export const agentRegistryAbiTyped = agentRegistryAbi.abi;
