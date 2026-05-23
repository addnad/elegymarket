"use client"

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
  ENG: { name: "England",                flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", eliminatedAt: "TBD" },
  FRA: { name: "France",                 flag: "🇫🇷", eliminatedAt: "TBD" },
  GER: { name: "Germany",                flag: "🇩🇪", eliminatedAt: "TBD" },
  ESP: { name: "Spain",                  flag: "🇪🇸", eliminatedAt: "TBD" },
  POR: { name: "Portugal",               flag: "🇵🇹", eliminatedAt: "TBD" },
  NED: { name: "Netherlands",            flag: "🇳🇱", eliminatedAt: "TBD" },
  BEL: { name: "Belgium",               flag: "🇧🇪", eliminatedAt: "TBD" },
  CRO: { name: "Croatia",               flag: "🇭🇷", eliminatedAt: "TBD" },
  SUI: { name: "Switzerland",            flag: "🇨🇭", eliminatedAt: "TBD" },
  AUT: { name: "Austria",               flag: "🇦🇹", eliminatedAt: "TBD" },
  NOR: { name: "Norway",                flag: "🇳🇴", eliminatedAt: "TBD" },
  SCO: { name: "Scotland",              flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", eliminatedAt: "TBD" },
  SWE: { name: "Sweden",               flag: "🇸🇪", eliminatedAt: "TBD" },
  TUR: { name: "Turkey",               flag: "🇹🇷", eliminatedAt: "TBD" },
  BIH: { name: "Bosnia & Herzegovina", flag: "🇧🇦", eliminatedAt: "TBD" },
  CZE: { name: "Czechia",              flag: "🇨🇿", eliminatedAt: "TBD" },
  // CAF
  ALG: { name: "Algeria",              flag: "🇩🇿", eliminatedAt: "TBD" },
  CPV: { name: "Cape Verde",           flag: "🇨🇻", eliminatedAt: "TBD" },
  EGY: { name: "Egypt",               flag: "🇪🇬", eliminatedAt: "TBD" },
  GHA: { name: "Ghana",               flag: "🇬🇭", eliminatedAt: "TBD" },
  CIV: { name: "Ivory Coast",         flag: "🇨🇮", eliminatedAt: "TBD" },
  MAR: { name: "Morocco",             flag: "🇲🇦", eliminatedAt: "TBD" },
  SEN: { name: "Senegal",             flag: "🇸🇳", eliminatedAt: "TBD" },
  RSA: { name: "South Africa",        flag: "🇿🇦", eliminatedAt: "TBD" },
  TUN: { name: "Tunisia",             flag: "🇹🇳", eliminatedAt: "TBD" },
  COD: { name: "DR Congo",            flag: "🇨🇩", eliminatedAt: "TBD" },
  // AFC
  AUS: { name: "Australia",           flag: "🇦🇺", eliminatedAt: "TBD" },
  IRN: { name: "Iran",                flag: "🇮🇷", eliminatedAt: "TBD" },
  JPN: { name: "Japan",               flag: "🇯🇵", eliminatedAt: "TBD" },
  JOR: { name: "Jordan",              flag: "🇯🇴", eliminatedAt: "TBD" },
  QAT: { name: "Qatar",               flag: "🇶🇦", eliminatedAt: "TBD" },
  KSA: { name: "Saudi Arabia",        flag: "🇸🇦", eliminatedAt: "TBD" },
  KOR: { name: "South Korea",         flag: "🇰🇷", eliminatedAt: "TBD" },
  UZB: { name: "Uzbekistan",          flag: "🇺🇿", eliminatedAt: "TBD" },
  IRQ: { name: "Iraq",                flag: "🇮🇶", eliminatedAt: "TBD" },
  // CONMEBOL
  ARG: { name: "Argentina",           flag: "🇦🇷", eliminatedAt: "TBD" },
  BRA: { name: "Brazil",              flag: "🇧🇷", eliminatedAt: "TBD" },
  COL: { name: "Colombia",            flag: "🇨🇴", eliminatedAt: "TBD" },
  ECU: { name: "Ecuador",             flag: "🇪🇨", eliminatedAt: "TBD" },
  PAR: { name: "Paraguay",            flag: "🇵🇾", eliminatedAt: "TBD" },
  URU: { name: "Uruguay",             flag: "🇺🇾", eliminatedAt: "TBD" },
  // CONCACAF
  USA: { name: "United States",       flag: "🇺🇸", eliminatedAt: "TBD" },
  CAN: { name: "Canada",              flag: "🇨🇦", eliminatedAt: "TBD" },
  MEX: { name: "Mexico",              flag: "🇲🇽", eliminatedAt: "TBD" },
  CUW: { name: "Curaçao",            flag: "🇨🇼", eliminatedAt: "TBD" },
  HAI: { name: "Haiti",               flag: "🇭🇹", eliminatedAt: "TBD" },
  PAN: { name: "Panama",              flag: "🇵🇦", eliminatedAt: "TBD" },
  // OFC
  NZL: { name: "New Zealand",         flag: "🇳🇿", eliminatedAt: "TBD" },
}

const ETH_USD = 3000

export function useGriefTokens() {
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
