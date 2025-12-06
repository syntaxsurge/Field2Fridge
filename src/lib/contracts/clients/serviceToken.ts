import { createPublicClient, createWalletClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import serviceTokenAbi from "../abi/Field2FridgeServiceToken.json";
import { CONTRACT_ADDRESSES } from "../addresses";

export const serviceTokenAddress = CONTRACT_ADDRESSES.bscTestnet.Field2FridgeServiceToken as `0x${string}`;

export const publicServiceTokenClient = createPublicClient({
  chain: bscTestnet,
  transport: http(process.env.BSC_TESTNET_RPC_URL),
});

export function createServiceTokenWalletClient(account: `0x${string}`) {
  return createWalletClient({
    account,
    chain: bscTestnet,
    transport: http(process.env.BSC_TESTNET_RPC_URL),
  });
}

export const serviceTokenAbiTyped = serviceTokenAbi.abi;
