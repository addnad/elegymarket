"use client"

import React from "react"

import { useReadContracts } from "wagmi"
import { formatEther } from "viem"
import { SENTIMENT_ORACLE_ABI, BONDING_CURVE_ABI, ORACLE_ADDRESS, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerMainnet } from "@/lib/web3"

export const TEAM_CODES = [
  "ENG","FRA","GER","ESP","POR","NED","BEL","CRO","SUI","AUT","NOR","SCO","SWE","TUR","BIH","CZE",
  "ALG","CPV","EGY","GHA","CIV","MAR","SEN","RSA","TUN","COD",
  "AUS","IRN","JPN","JOR","QAT","KSA","KOR","UZB","IRQ",
  "ARG","BRA","COL","ECU","PAR","URU",
  "USA","CAN","MEX","CUW","HAI","PAN",
  "NZL",
]

export const TEAM_META: Record<string, { name: string; flag: string; eliminatedAt: string }> = {
  // UEFA
  ENG: { name: "England",                flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", eliminatedAt: "Group L" },
  FRA: { name: "France",                 flag: "🇫🇷", eliminatedAt: "Group I" },
  GER: { name: "Germany",                flag: "🇩🇪", eliminatedAt: "Group E" },
  ESP: { name: "Spain",                  flag: "🇪🇸", eliminatedAt: "Group H" },
  POR: { name: "Portugal",               flag: "🇵🇹", eliminatedAt: "Group K" },
  NED: { name: "Netherlands",            flag: "🇳🇱", eliminatedAt: "Group F" },
  BEL: { name: "Belgium",               flag: "🇧🇪", eliminatedAt: "Group G" },
  CRO: { name: "Croatia",               flag: "🇭🇷", eliminatedAt: "Group L" },
  SUI: { name: "Switzerland",            flag: "🇨🇭", eliminatedAt: "Group B" },
  AUT: { name: "Austria",               flag: "🇦🇹", eliminatedAt: "Group J" },
  NOR: { name: "Norway",                flag: "🇳🇴", eliminatedAt: "Group I" },
  SCO: { name: "Scotland",              flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", eliminatedAt: "Group C" },
  SWE: { name: "Sweden",               flag: "🇸🇪", eliminatedAt: "Group F" },
  TUR: { name: "Turkey",               flag: "🇹🇷", eliminatedAt: "Group D" },
  BIH: { name: "Bosnia & Herzegovina", flag: "🇧🇦", eliminatedAt: "Group B" },
  CZE: { name: "Czechia",              flag: "🇨🇿", eliminatedAt: "Group A" },
  // CAF
  ALG: { name: "Algeria",              flag: "🇩🇿", eliminatedAt: "Group J" },
  CPV: { name: "Cape Verde",           flag: "🇨🇻", eliminatedAt: "Group H" },
  EGY: { name: "Egypt",               flag: "🇪🇬", eliminatedAt: "Group G" },
  GHA: { name: "Ghana",               flag: "🇬🇭", eliminatedAt: "Group L" },
  CIV: { name: "Ivory Coast",         flag: "🇨🇮", eliminatedAt: "Group E" },
  MAR: { name: "Morocco",             flag: "🇲🇦", eliminatedAt: "Group C" },
  SEN: { name: "Senegal",             flag: "🇸🇳", eliminatedAt: "Group I" },
  RSA: { name: "South Africa",       flag: "🇿🇦", eliminatedAt: "Group A" },
  TUN: { name: "Tunisia",             flag: "🇹🇳", eliminatedAt: "Group F" },
  COD: { name: "DR Congo",            flag: "🇨🇩", eliminatedAt: "Group K" },
  // AFC
  AUS: { name: "Australia",           flag: "🇦🇺", eliminatedAt: "Group D" },
  IRN: { name: "Iran",               flag: "🇮🇷", eliminatedAt: "Group G" },
  JPN: { name: "Japan",               flag: "🇯🇵", eliminatedAt: "Group F" },
  JOR: { name: "Jordan",              flag: "🇯🇴", eliminatedAt: "Group J" },
  QAT: { name: "Qatar",               flag: "🇶🇦", eliminatedAt: "Group B" },
  KSA: { name: "Saudi Arabia",       flag: "🇸🇦", eliminatedAt: "Group H" },
  KOR: { name: "South Korea",       flag: "🇰🇷", eliminatedAt: "Group A" },
  UZB: { name: "Uzbekistan",         flag: "🇺🇿", eliminatedAt: "Group K" },
  IRQ: { name: "Iraq",               flag: "🇮🇶", eliminatedAt: "Group I" },
  // CONMEBOL
  ARG: { name: "Argentina",          flag: "🇦🇷", eliminatedAt: "Group J" },
  BRA: { name: "Brazil",              flag: "🇧🇷", eliminatedAt: "Group C" },
  COL: { name: "Colombia",            flag: "🇨🇴", eliminatedAt: "Group K" },
  ECU: { name: "Ecuador",             flag: "🇪🇨", eliminatedAt: "Group E" },
  PAR: { name: "Paraguay",            flag: "🇵🇾", eliminatedAt: "Group D" },
  URU: { name: "Uruguay",             flag: "🇺🇾", eliminatedAt: "Group H" },
  // CONCACAF
  USA: { name: "United States",       flag: "🇺🇸", eliminatedAt: "Group D" },
  CAN: { name: "Canada",              flag: "🇨🇦", eliminatedAt: "Group B" },
  MEX: { name: "Mexico",              flag: "🇲🇽", eliminatedAt: "Group A" },
  CUW: { name: "Curaçao",             flag: "🇨🇼", eliminatedAt: "Group E" },
  HAI: { name: "Haiti",              flag: "🇭🇹", eliminatedAt: "Group C" },
  PAN: { name: "Panama",              flag: "🇵🇦", eliminatedAt: "Group L" },
  // OFC
  NZL: { name: "New Zealand",       flag: "🇳🇿", eliminatedAt: "Group G" },
}

const OKB_USD = 84

export function useGriefTokens() {
// Fetch scores from backend cache (1 call instead of 48 RPC calls)
const [backendScores, setBackendScores] = React.useState<Record<string, number>>({})

React.useEffect(() => {
  async function fetchScores() {
    try {
      const res = await fetch('https://elegymarket.onrender.com/api/tokens')
      const data = await res.json()
      if (data.tokens) {
        const scores: Record<string, number> = {}
        data.tokens.forEach((t: any) => { scores[t.teamCode] = t.score })
        setBackendScores(scores)
      }
      if (data.okbPrice) (window as any).__OKB_USD = data.okbPrice
    } catch(e) {}
  }
  fetchScores()
  const interval = setInterval(fetchScores, 30_000)
  return () => clearInterval(interval)
}, [])

  const contracts = TEAM_CODES.flatMap((code) => [
    {
      address: ORACLE_ADDRESS,
      abi: SENTIMENT_ORACLE_ABI,
      functionName: "getScore" as const,
      args: [code] as [string],
      chainId: xlayerMainnet.id,
    },
    {
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "getBuyPrice" as const,
      args: [code] as [string],
      chainId: xlayerMainnet.id,
    },
    {
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "tokens" as const,
      args: [code] as [string],
      chainId: xlayerMainnet.id,
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

    const sentimentScore = backendScores[code] ?? (scoreResult ? Number(scoreResult[0]) : 50)
    const price = priceResult ? parseFloat(formatEther(priceResult)) : 0.0001
    const priceUSD = price * OKB_USD
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
