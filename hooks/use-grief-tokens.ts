"use client"

import { useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { SENTIMENT_ORACLE_ABI, BONDING_CURVE_ABI, ORACLE_ADDRESS, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerTestnet } from "@/lib/web3"

const TEAM_CODES = ["ENG", "BRA", "FRA", "MAR", "ARG"]

const TEAM_META: Record<string, { name: string; flag: string; eliminatedAt: string }> = {
  ENG: { name: "England",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", eliminatedAt: "Quarter Final" },
  BRA: { name: "Brazil",    flag: "🇧🇷",         eliminatedAt: "Round of 16"  },
  FRA: { name: "France",    flag: "🇫🇷",         eliminatedAt: "Semi Final"   },
  MAR: { name: "Morocco",   flag: "🇲🇦",         eliminatedAt: "Quarter Final"},
  ARG: { name: "Argentina", flag: "🇦🇷",         eliminatedAt: "Round of 16"  },
}

const ETH_USD = 3000

export function useGriefTokens() {
  const contracts = TEAM_CODES.flatMap((code) => [
    {
      address: ORACLE_ADDRESS,
      abi: SENTIMENT_ORACLE_ABI,
      functionName: "getScore" as const,
      args: [code] as [string],
      chainId: xlayerTestnet.id,
    },
    {
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "getBuyPrice" as const,
      args: [code] as [string],
      chainId: xlayerTestnet.id,
    },
    {
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "tokens" as const,
      args: [code] as [string],
      chainId: xlayerTestnet.id,
    },
  ])

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { refetchInterval: 30_000 },
  })

  const tokens = TEAM_CODES.map((code, i) => {
    const meta = TEAM_META[code]
    const base = i * 3

    const scoreResult = data?.[base]?.result as [number, bigint] | undefined
    const priceResult = data?.[base + 1]?.result as bigint | undefined
    const tokenResult = data?.[base + 2]?.result as [string, string, bigint, bigint, boolean] | undefined

    const sentimentScore = scoreResult ? Number(scoreResult[0]) : 50
    const price = priceResult ? parseFloat(formatEther(priceResult)) : 0.0001
    const priceUSD = price * ETH_USD
    const supply = tokenResult ? Number(tokenResult[2]) : 0

    return {
      teamCode: code,
      teamName: meta.name,
      flag: meta.flag,
      eliminatedAt: meta.eliminatedAt,
      sentimentScore,
      price,
      priceUSD,
      supply,
      change24h: 0,
      sparkline: [price * 0.8, price * 0.85, price * 0.9, price * 0.95, price],
      active: tokenResult ? tokenResult[4] : false,
    }
  })

  return { tokens, isLoading, refetch }
}
