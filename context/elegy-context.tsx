"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { useAccount, useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { useGriefTokens } from "@/hooks/use-grief-tokens"
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

const OKB_USD = 84 // fetched dynamically below

export type Holding = {
  teamCode: string; teamName: string; flag: string
  amount: number; sellPrice: number; buyPrice: number
  valueOKB: number; valueUSD: number; pnlOKB: number; pnlPct: number
}

export interface GriefToken {
  teamCode: string; teamName: string; flag: string
  sentimentScore: number; price: number; priceUSD: number
  supply: number; change24h: number; sparkline: number[]
  eliminatedAt: string; active: boolean
}

interface ElegyState {
  tokens: GriefToken[]
  totalVolume: number
  totalTraders: number
  isLoading: boolean
  refetch: () => void
  holdings: Holding[]
  totalValueUSD: number
  totalValueOKB: number
  totalPnlOKB: number
  isPortfolioLoading: boolean
}

const ElegyContext = createContext<ElegyState | null>(null)

export function ElegyProvider({ children }: { children: React.ReactNode }) {
  // Fetch live OKB price every 5 minutes
  useEffect(() => {
    async function fetchOKBPrice() {
      try {
        const res = await fetch("https://elegymarket.onrender.com/api/okb-price");
        const data = await res.json();
        if (data?.price) (window as any).__OKB_USD = data.price;
      } catch(e) {}
    }
    fetchOKBPrice();
    const interval = setInterval(fetchOKBPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { tokens, isLoading, refetch } = useGriefTokens()
  const { address } = useAccount()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true)

  const { data: balanceData } = useReadContracts({
    contracts: TEAM_CODES.map((code) => ({
      address: TOKEN_ADDRESSES[code],
      abi: GRIEF_TOKEN_ABI,
      functionName: "balanceOf" as const,
      args: [address as `0x${string}`],
      chainId: xlayerMainnet.id,
    })),
    query: { enabled: !!address, refetchInterval: 30_000 },
  })

  const { data: sellData } = useReadContracts({
    contracts: TEAM_CODES.map((code) => ({
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "getSellPriceFor" as const,
      args: [code, 1n] as [string, bigint],
      chainId: xlayerMainnet.id,
    })),
    query: { refetchInterval: 30_000 },
  })

  const { data: buyData } = useReadContracts({
    contracts: TEAM_CODES.map((code) => ({
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "getBuyPriceFor" as const,
      args: [code, 1n] as [string, bigint],
      chainId: xlayerMainnet.id,
    })),
    query: { refetchInterval: 30_000 },
  })

  useEffect(() => {
    if (!balanceData || !address) return
    const fresh = TEAM_CODES.map((code, i) => {
      const meta       = TEAM_META[code]
      const balanceRaw = balanceData[i]?.result as bigint | undefined
      const sellRaw    = sellData?.[i]?.result as bigint | undefined
      const buyRaw     = buyData?.[i]?.result as bigint | undefined
      const amount     = balanceRaw ? parseFloat(formatEther(balanceRaw)) : 0
      const sellPrice  = sellRaw ? parseFloat(formatEther(sellRaw)) : 0
      const buyPrice   = buyRaw ? parseFloat(formatEther(buyRaw)) : 0
      const valueOKB   = amount * sellPrice
      const costOKB    = amount * buyPrice
      const pnlOKB     = valueOKB - costOKB
      return {
        teamCode: code, teamName: meta.name, flag: meta.flag,
        amount, sellPrice, buyPrice,
        valueOKB, valueUSD: valueOKB * OKB_USD,
        pnlOKB, pnlPct: costOKB > 0 ? (pnlOKB / costOKB) * 100 : 0,
      }
    }).filter(h => h.amount > 0)
    setHoldings(fresh)
    setIsPortfolioLoading(false)
  }, [balanceData, sellData, buyData, address])

  const [volumeData, setVolumeData] = useState({ totalVolumeOKB: 0, totalTraders: 0 })

  useEffect(() => {
    async function fetchVolume() {
      try {
        const res = await fetch("http://localhost:3001/api/stats")
        const data = await res.json()
        if (data.totalVolumeOKB !== undefined) setVolumeData(data)
      } catch(e) {}
    }
    fetchVolume()
    const interval = setInterval(fetchVolume, 60_000)
    return () => clearInterval(interval)
  }, [])

  const OKB_USD = typeof window !== "undefined" ? (window as any).__OKB_USD || 84 : 84
  const totalVolume  = volumeData.totalVolumeUSD || volumeData.totalVolumeOKB * OKB_USD
  const totalTraders = volumeData.totalTraders
  const totalValueUSD = holdings.reduce((sum, h) => sum + h.valueUSD, 0)
  const totalValueOKB = holdings.reduce((sum, h) => sum + h.valueOKB, 0)
  const totalPnlOKB   = holdings.reduce((sum, h) => sum + h.pnlOKB, 0)

  return (
    <ElegyContext.Provider value={{
      tokens, totalVolume, totalTraders, isLoading, refetch,
      holdings, totalValueUSD, totalValueOKB, totalPnlOKB, isPortfolioLoading,
    }}>
      {children}
    </ElegyContext.Provider>
  )
}

export function useElegy() {
  const ctx = useContext(ElegyContext)
  if (!ctx) throw new Error("useElegy must be used within ElegyProvider")
  return ctx
}
