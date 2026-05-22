export const SENTIMENT_ORACLE_ABI = [
  {
    name: "getScore",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [
      { name: "value", type: "uint8" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "getMultiplier",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

export const BONDING_CURVE_ABI = [
  {
    name: "getBuyPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getSellPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokens",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [
      { name: "token", type: "address" },
      { name: "teamCode", type: "string" },
      { name: "supply", type: "uint256" },
      { name: "reserve", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [],
  },
  {
    name: "sell",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "teamCode", type: "string" }],
    outputs: [],
  },
] as const

export const GRIEF_TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const

export const ORACLE_ADDRESS = process.env.NEXT_PUBLIC_SENTIMENT_ORACLE as `0x${string}`
export const CURVE_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE as `0x${string}`
