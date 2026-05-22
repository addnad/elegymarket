"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useElegy } from "@/context/elegy-context"
import { TradeModal } from "@/components/dashboard/trade-modal"
import { useState } from "react"
import { useParams } from "next/navigation"
import { Flame, TrendingUp, TrendingDown, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import { BONDING_CURVE_ABI, CURVE_ADDRESS } from "@/lib/contracts"
import { xlayerTestnet } from "@/lib/web3"

function getGriefColor(score: number) {
  if (score >= 75) return "text-red-400"
  if (score >= 50) return "text-orange-400"
  if (score >= 25) return "text-yellow-400"
  return "text-muted-foreground"
}

function getGriefLabel(score: number) {
  if (score >= 75) return "Peak Grief"
  if (score >= 50) return "Grieving"
  if (score >= 25) return "Fading"
  return "Moving On"
}

function TokenDetailInner() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()
  const { tokens } = useElegy()
  const [showTrade, setShowTrade] = useState(false)
  const token = tokens.find(t => t.teamCode === code)

  const { data: buyPrice1 } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getBuyPriceFor",
    args: [code, 1n],
    chainId: xlayerTestnet.id,
    query: { refetchInterval: 10_000 },
  })

  const { data: buyPrice3 } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getBuyPriceFor",
    args: [code, 3n],
    chainId: xlayerTestnet.id,
    query: { refetchInterval: 10_000 },
  })

  const { data: buyPrice5 } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getBuyPriceFor",
    args: [code, 5n],
    chainId: xlayerTestnet.id,
    query: { refetchInterval: 10_000 },
  })

  const { data: tokenInfo } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "tokens",
    args: [code],
    chainId: xlayerTestnet.id,
    query: { refetchInterval: 10_000 },
  })

  if (!token) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Token not found</p>
        <Link href="/tokens" className="text-lime text-sm mt-2 block">Back to tokens</Link>
      </div>
    )
  }

  const supply = tokenInfo ? Number((tokenInfo as any)[2]) : token.supply
  const reserve = tokenInfo ? parseFloat(formatEther((tokenInfo as any)[3])) : 0

  // Build price curve data points
  const pricePoints = Array.from({ length: Math.max(supply + 5, 10) }, (_, i) => {
    const base = 0.0001 + 0.000001 * i
    const multiplier = 1 + (token.sentimentScore / 100) * 2
    return {
      supply: i,
      price: +(base * multiplier * 3000).toFixed(4),
      current: i === supply,
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border border-border px-3 py-2 text-xs font-mono">
          <p className="text-muted-foreground">Supply: {payload[0].payload.supply}</p>
          <p className="text-foreground">${payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back */}
      <Link href="/tokens" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        All tokens
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{token.flag}</span>
          <div>
            <h1 className="text-2xl font-semibold">{token.teamName}</h1>
            <p className="text-sm font-mono text-muted-foreground">GRIEF_{token.teamCode}</p>
            <div className={`flex items-center gap-1.5 mt-1 ${getGriefColor(token.sentimentScore)}`}>
              <Flame className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">{token.sentimentScore}/100</span>
              <span className="text-xs">— {getGriefLabel(token.sentimentScore)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowTrade(true)}
          className="px-6 py-2.5 bg-lime/10 border border-lime/40 text-lime hover:bg-lime/20 transition-colors font-medium text-sm"
        >
          Trade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Current Price</p>
          <p className="text-xl font-mono font-bold">${token.priceUSD.toFixed(4)}</p>
          <div className={`flex items-center gap-1 text-xs font-mono mt-1 ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
            {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {token.change24h >= 0 ? "+" : ""}{token.change24h}% 24h
          </div>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Supply</p>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-xl font-mono font-bold">{supply}</p>
          </div>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Reserve</p>
          <p className="text-xl font-mono font-bold">{reserve.toFixed(6)}</p>
          <p className="text-xs text-muted-foreground">OKB</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Eliminated</p>
          <p className="text-sm font-mono font-medium">{token.eliminatedAt}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bonding Curve Chart */}
        <div className="lg:col-span-2 border border-border p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
            Bonding Curve — Price vs Supply
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pricePoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="supply" tick={{ fontSize: 10, fill: "#6b7280" }} label={{ value: "Supply", position: "insideBottom", offset: -2, fill: "#6b7280", fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="price" stroke="#a3e635" strokeWidth={2} dot={(props) => {
                if (props.payload.current) {
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#a3e635" stroke="#000" strokeWidth={2} />
                }
                return <g key={props.key} />
              }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Green dot = current supply ({supply} tokens)
          </p>
        </div>

        {/* Price Tiers */}
        <div className="border border-border p-4">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
            Buy Price Tiers
          </p>
          <div className="space-y-3">
            {[
              { label: "1 token",  price: buyPrice1 },
              { label: "3 tokens", price: buyPrice3 },
              { label: "5 tokens", price: buyPrice5 },
            ].map(tier => (
              <div key={tier.label} className="flex items-center justify-between p-3 bg-surface border border-border">
                <span className="text-sm text-muted-foreground">{tier.label}</span>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium">
                    {tier.price ? parseFloat(formatEther(tier.price as bigint)).toFixed(6) : "..."} OKB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${tier.price ? (parseFloat(formatEther(tier.price as bigint)) * 3000).toFixed(4) : "..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowTrade(true)}
            className="w-full mt-4 py-2.5 bg-lime/10 border border-lime/40 text-lime hover:bg-lime/20 transition-colors font-medium text-sm"
          >
            Trade Now
          </button>
        </div>
      </div>

      {showTrade && <TradeModal token={token} onClose={() => setShowTrade(false)} />}
    </div>
  )
}

export default function TokenDetailPage() {
  return (
    <DashboardLayout>
      <TokenDetailInner />
    </DashboardLayout>
  )
}
