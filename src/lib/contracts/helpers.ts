import { Hex, formatEther } from "viem";
import { agentRegistryAbiTyped, agentRegistryAddress, createAgentRegistryWalletClient } from "./clients/agentRegistry";
import { serviceTokenAbiTyped, serviceTokenAddress, createServiceTokenWalletClient } from "./clients/serviceToken";

export async function registerAgent(account: `0x${string}`, tokenURI: string) {
  const client = createAgentRegistryWalletClient(account);
  const hash = await client.writeContract({
    address: agentRegistryAddress,
    abi: agentRegistryAbiTyped,
    functionName: "register",
    args: [tokenURI],
  });
  return hash as Hex;
}

export async function approveServiceToken(account: `0x${string}`, spender: `0x${string}`, amountWei: bigint) {
  const client = createServiceTokenWalletClient(account);
  const hash = await client.writeContract({
    address: serviceTokenAddress,
    abi: serviceTokenAbiTyped,
    functionName: "approve",
    args: [spender, amountWei],
  });
  return hash as Hex;
}

export async function transferServiceToken(account: `0x${string}`, to: `0x${string}`, amountWei: bigint) {
  const client = createServiceTokenWalletClient(account);
  const hash = await client.writeContract({
    address: serviceTokenAddress,
    abi: serviceTokenAbiTyped,
    functionName: "transfer",
    args: [to, amountWei],
  });
  return hash as Hex;
}

export function formatServiceToken(amountWei: bigint) {
  return formatEther(amountWei);
}
