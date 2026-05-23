"use client"

import { useAccount, useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { GRIEF_TOKEN_ABI, BONDING_CURVE_ABI, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerMainnet } from "@/lib/web3"
import { TEAM_CODES, TEAM_META } from "@/hooks/use-grief-tokens"

const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  ENG: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ENG as `0x${string}`,
  FRA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_FRA as `0x${string}`,
  GER: process.env.NEXT_PUBLIC_GRIEF_TOKEN_GER as `0x${string}`,
  ESP: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ESP as `0x${string}`,
  POR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_POR as `0x${string}`,
  NED: process.env.NEXT_PUBLIC_GRIEF_TOKEN_NED as `0x${string}`,
  BEL: process.env.NEXT_PUBLIC_GRIEF_TOKEN_BEL as `0x${string}`,
  CRO: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CRO as `0x${string}`,
  SUI: process.env.NEXT_PUBLIC_GRIEF_TOKEN_SUI as `0x${string}`,
  AUT: process.env.NEXT_PUBLIC_GRIEF_TOKEN_AUT as `0x${string}`,
  NOR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_NOR as `0x${string}`,
  SCO: process.env.NEXT_PUBLIC_GRIEF_TOKEN_SCO as `0x${string}`,
  SWE: process.env.NEXT_PUBLIC_GRIEF_TOKEN_SWE as `0x${string}`,
  TUR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_TUR as `0x${string}`,
  BIH: process.env.NEXT_PUBLIC_GRIEF_TOKEN_BIH as `0x${string}`,
  CZE: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CZE as `0x${string}`,
  ALG: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ALG as `0x${string}`,
  CPV: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CPV as `0x${string}`,
  EGY: process.env.NEXT_PUBLIC_GRIEF_TOKEN_EGY as `0x${string}`,
  GHA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_GHA as `0x${string}`,
  CIV: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CIV as `0x${string}`,
  MAR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_MAR as `0x${string}`,
  SEN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_SEN as `0x${string}`,
  RSA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_RSA as `0x${string}`,
  TUN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_TUN as `0x${string}`,
  COD: process.env.NEXT_PUBLIC_GRIEF_TOKEN_COD as `0x${string}`,
  AUS: process.env.NEXT_PUBLIC_GRIEF_TOKEN_AUS as `0x${string}`,
  IRN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_IRN as `0x${string}`,
  JPN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_JPN as `0x${string}`,
  JOR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_JOR as `0x${string}`,
  QAT: process.env.NEXT_PUBLIC_GRIEF_TOKEN_QAT as `0x${string}`,
  KSA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_KSA as `0x${string}`,
  KOR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_KOR as `0x${string}`,
  UZB: process.env.NEXT_PUBLIC_GRIEF_TOKEN_UZB as `0x${string}`,
  IRQ: process.env.NEXT_PUBLIC_GRIEF_TOKEN_IRQ as `0x${string}`,
  ARG: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ARG as `0x${string}`,
  BRA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_BRA as `0x${string}`,
  COL: process.env.NEXT_PUBLIC_GRIEF_TOKEN_COL as `0x${string}`,
  ECU: process.env.NEXT_PUBLIC_GRIEF_TOKEN_ECU as `0x${string}`,
  PAR: process.env.NEXT_PUBLIC_GRIEF_TOKEN_PAR as `0x${string}`,
  URU: process.env.NEXT_PUBLIC_GRIEF_TOKEN_URU as `0x${string}`,
  USA: process.env.NEXT_PUBLIC_GRIEF_TOKEN_USA as `0x${string}`,
  CAN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CAN as `0x${string}`,
  MEX: process.env.NEXT_PUBLIC_GRIEF_TOKEN_MEX as `0x${string}`,
  CUW: process.env.NEXT_PUBLIC_GRIEF_TOKEN_CUW as `0x${string}`,
  HAI: process.env.NEXT_PUBLIC_GRIEF_TOKEN_HAI as `0x${string}`,
  PAN: process.env.NEXT_PUBLIC_GRIEF_TOKEN_PAN as `0x${string}`,
  NZL: process.env.NEXT_PUBLIC_GRIEF_TOKEN_NZL as `0x${string}`,
}

const OKB_USD = 84

export function usePortfolio() {
  const { address } = useAccount()

  const balanceContracts = TEAM_CODES.map((code) => ({
    address: TOKEN_ADDRESSES[code],
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
    const meta       = TEAM_META[code]
    const balanceRaw = balanceData?.[i]?.result as bigint | undefined
    const sellRaw    = sellData?.[i]?.result as bigint | undefined
    const buyRaw     = buyData?.[i]?.result as bigint | undefined

    const amount     = balanceRaw ? parseFloat(formatEther(balanceRaw)) : 0
    const sellPrice  = sellRaw    ? parseFloat(formatEther(sellRaw))    : 0
    const buyPrice   = buyRaw     ? parseFloat(formatEther(buyRaw))     : 0

    const valueOKB   = amount * sellPrice
    const valueUSD   = valueOKB * OKB_USD
    const costOKB    = amount * buyPrice
    const pnlOKB     = valueOKB - costOKB
    const pnlPct     = costOKB > 0 ? (pnlOKB / costOKB) * 100 : 0

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
