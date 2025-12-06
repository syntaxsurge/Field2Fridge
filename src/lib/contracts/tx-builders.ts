import { encodeFunctionData, parseUnits } from "viem";
import type { Abi } from "viem";
import registryAbiJson from "./abi/Field2FridgeAgentRegistry.json";
import serviceTokenAbiJson from "./abi/Field2FridgeServiceToken.json";
import { CONTRACT_ADDRESSES } from "./addresses";

type NetworkKey = keyof typeof CONTRACT_ADDRESSES;
const registryAbi = registryAbiJson.abi as Abi;
const serviceTokenAbi = serviceTokenAbiJson.abi as Abi;

export type BuiltTx = {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
  description: string;
};

export function buildServiceTokenTransfer(params: {
  network: NetworkKey;
  to: `0x${string}`;
  amount: string;
  decimals?: number;
}): BuiltTx {
  const token = CONTRACT_ADDRESSES[params.network].Field2FridgeServiceToken as `0x${string}`;
  const decimals = params.decimals ?? 18;
  const value = parseUnits(params.amount, decimals);
  return {
    to: token,
    data: encodeFunctionData({
      abi: serviceTokenAbi,
      functionName: "transfer",
      args: [params.to, value],
    }),
    description: `Transfer ${params.amount} service tokens to ${params.to}`,
  };
}

export function buildRegisterAgent(params: {
  network: NetworkKey;
  agentId: string;
  owner: `0x${string}`;
}): BuiltTx {
  const registry = CONTRACT_ADDRESSES[params.network].Field2FridgeAgentRegistry as `0x${string}`;
  return {
    to: registry,
    data: encodeFunctionData({
      abi: registryAbi,
      functionName: "registerAgent",
      args: [params.agentId, params.owner],
    }),
    description: `Register agent ${params.agentId} for ${params.owner}`,
  };
}
