"use client"

import { useAccount, useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { GRIEF_TOKEN_ABI, BONDING_CURVE_ABI, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerMainnet } from "@/lib/web3"
import { TEAM_CODES, TEAM_META } from "@/hooks/use-grief-tokens"

function getTokenAddress(code: string): `0x${string}` | undefined {
  const key = `NEXT_PUBLIC_GRIEF_TOKEN_${code}`
  return process.env[key] as `0x${string}` | undefined
}

const OKB_USD = 84

export function usePortfolio() {
  const { address } = useAccount()

  const balanceContracts = TEAM_CODES.map((code) => ({
    address: getTokenAddress(code)!,
    abi: GRIEF_TOKEN_ABI,
    functionName: "balanceOf" as const,
    args: [address as `0x${string}`],
    chainId: xlayerMainnet.id,
  }))

  const sellPriceContracts = TEAM_CODES.map((code) => ({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getSellPriceFor" as const,
    args: [code, 1n] as [string, bigint],
    chainId: xlayerMainnet.id,
  }))

  const buyPriceContracts = TEAM_CODES.map((code) => ({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getBuyPriceFor" as const,
    args: [code, 1n] as [string, bigint],
    chainId: xlayerMainnet.id,
  }))

  const { data: balanceData, isLoading } = useReadContracts({
    contracts: balanceContracts,
    query: { enabled: !!address, refetchInterval: 15_000 },
  })

  const { data: sellData } = useReadContracts({
    contracts: sellPriceContracts,
    query: { refetchInterval: 15_000 },
  })

  const { data: buyData } = useReadContracts({
    contracts: buyPriceContracts,
    query: { refetchInterval: 15_000 },
  })

  const holdings = TEAM_CODES.map((code, i) => {
    const meta        = TEAM_META[code]
    const balanceRaw  = balanceData?.[i]?.result as bigint | undefined
    const sellRaw     = sellData?.[i]?.result as bigint | undefined
    const buyRaw      = buyData?.[i]?.result as bigint | undefined

    const amount      = balanceRaw ? parseFloat(formatEther(balanceRaw)) : 0
    const sellPrice   = sellRaw    ? parseFloat(formatEther(sellRaw))    : 0
    const buyPrice    = buyRaw     ? parseFloat(formatEther(buyRaw))     : 0

    const valueOKB    = amount * sellPrice
    const valueUSD    = valueOKB * OKB_USD
    const costOKB     = amount * buyPrice
    const pnlOKB      = valueOKB - costOKB
    const pnlPct      = costOKB > 0 ? (pnlOKB / costOKB) * 100 : 0

    return {
      teamCode: code,
      teamName: meta.name,
      flag: meta.flag,
      amount,
      sellPrice,
      buyPrice,
      valueOKB,
      valueUSD,
      pnlOKB,
      pnlPct,
    }
  }).filter(h => h.amount > 0)

  const totalValueUSD = holdings.reduce((sum, h) => sum + h.valueUSD, 0)
  const totalValueOKB = holdings.reduce((sum, h) => sum + h.valueOKB, 0)
  const totalPnlOKB   = holdings.reduce((sum, h) => sum + h.pnlOKB, 0)

  return { holdings, totalValueUSD, totalValueOKB, totalPnlOKB, isLoading }
}
