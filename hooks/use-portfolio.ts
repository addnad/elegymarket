"use client"

import { useAccount, useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { GRIEF_TOKEN_ABI, BONDING_CURVE_ABI, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerTestnet } from "@/lib/web3"

const TEAM_CODES = ["ENG", "BRA", "FRA", "GER"]

const GRIEF_TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  ENG: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ENG as `0x${string}`,
  BRA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_BRA as `0x${string}`,
  FRA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_FRA as `0x${string}`,
  GER: process.env.NEXT_PUBLIC_GRIEF_TOKEN_GER as `0x${string}`,
}

export function usePortfolio() {
  const { address } = useAccount()

  const balanceContracts = TEAM_CODES.filter(c => GRIEF_TOKEN_ADDRESSES[c]).map((code) => ({
    address: GRIEF_TOKEN_ADDRESSES[code],
    abi: GRIEF_TOKEN_ABI,
    functionName: "balanceOf" as const,
    args: [address as `0x${string}`],
    chainId: xlayerTestnet.id,
  }))

  const priceContracts = TEAM_CODES.map((code) => ({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getSellPrice" as const,
    args: [code] as [string],
    chainId: xlayerTestnet.id,
  }))

  const { data: balanceData, isLoading } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: !!address, refetchInterval: 15_000 },
  })

  const { data: priceData } = useReadContracts({
    contracts: priceContracts,
    query: { refetchInterval: 30_000 },
  })

  const holdings = TEAM_CODES.map((code, i) => {
    const balanceRaw = balanceData?.[i]?.result as bigint | undefined
    const sellPriceRaw = priceData?.[i]?.result as bigint | undefined

    const amount = balanceRaw ? parseFloat(formatEther(balanceRaw)) : 0
    const sellPrice = sellPriceRaw ? parseFloat(formatEther(sellPriceRaw)) : 0
    const valueETH = amount * sellPrice
    const valueUSD = valueETH * 3000

    return { teamCode: code, amount, sellPrice, valueETH, valueUSD }
  }).filter(h => h.amount > 0)

  const totalValueUSD = holdings.reduce((sum, h) => sum + h.valueUSD, 0)

  return { holdings, totalValueUSD, isLoading }
}
