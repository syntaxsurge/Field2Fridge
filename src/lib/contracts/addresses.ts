export const CONTRACT_ADDRESSES = {
  bscTestnet: {
    Field2FridgeAgentRegistry:
      process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ??
      "0x0000000000000000000000000000000000000000",
    Field2FridgeServiceToken:
      process.env.NEXT_PUBLIC_SERVICE_TOKEN_ADDRESS ??
      "0x0000000000000000000000000000000000000000",
  },
} as const;
