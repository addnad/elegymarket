"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { GlanceCard } from "@/components/dashboard/glance-card"
import { useElegy } from "@/context/elegy-context"
import { TrendingUp, TrendingDown, Activity, Users, DollarSign, Flame } from "lucide-react"
import Link from "next/link"

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

function DashboardInner() {
  const { tokens, totalVolume, totalTraders, lastUpdated, refresh } = useElegy()

  const highestGrief = Math.max(...tokens.map(t => t.sentimentScore))
  const mostGrieving = tokens.find(t => t.sentimentScore === highestGrief)

  const glanceCards = [
    {
      title: "Active Grief Tokens",
      value: tokens.length,
      suffix: "",
      change: 0,
      sparklineData: [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 4],
    },
    {
      title: "Highest Grief Score",
      value: highestGrief,
      suffix: "/100",
      change: 5.2,
      sparklineData: [60, 65, 70, 72, 78, 80, 82, 83, 84, 85, 85, 85],
    },
    {
      title: "Total Volume (USD)",
      value: totalVolume,
      prefix: "$",
      suffix: "",
      change: 8.4,
      sparklineData: [10, 18, 24, 30, 38, 45, 52, 60, 68, 75, 82, totalVolume],
    },
    {
      title: "Total Traders",
      value: totalTraders,
      suffix: "",
      change: 14.2,
      sparklineData: [20, 35, 48, 65, 80, 100, 120, 140, 160, 200, 240, totalTraders],
    },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Live Sentiment Market
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Grief Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trade fan grief as World Cup teams get eliminated
        </p>
      </div>

      {/* Glance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {glanceCards.map((card) => (
          <GlanceCard key={card.title} {...card} />
        ))}
      </div>

      {/* Active Grief Tokens */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
            Active Grief Tokens
          </h2>
          <Link
            href="/tokens"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="border border-border">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border bg-surface">
            <span className="col-span-3 text-xs font-mono text-muted-foreground uppercase">Team</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Grief</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Price</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">24h</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Stage</span>
            <span className="col-span-1 text-xs font-mono text-muted-foreground uppercase"></span>
          </div>

          {/* Token Rows */}
          {tokens.map((token, i) => (
            <div
              key={token.teamCode}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors items-center"
            >
              {/* Team */}
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-lg">{token.flag}</span>
                <div>
                  <p className="text-sm font-medium">{token.teamName}</p>
                  <p className="text-xs font-mono text-muted-foreground">GRIEF_{token.teamCode}</p>
                </div>
              </div>

              {/* Grief Score */}
              <div className="col-span-2">
                <div className="flex items-center gap-1.5">
                  <Flame className={`w-3 h-3 ${getGriefColor(token.sentimentScore)}`} />
                  <span className={`text-sm font-mono font-medium ${getGriefColor(token.sentimentScore)}`}>
                    {token.sentimentScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{getGriefLabel(token.sentimentScore)}</p>
              </div>

              {/* Price */}
              <div className="col-span-2">
                <p className="text-sm font-mono">${token.priceUSD.toFixed(3)}</p>
                <p className="text-xs text-muted-foreground font-mono">{token.price.toFixed(6)} OKB</p>
              </div>

              {/* 24h Change */}
              <div className="col-span-2">
                <div className={`flex items-center gap-1 text-sm font-mono ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {token.change24h >= 0
                    ? <TrendingUp className="w-3 h-3" />
                    : <TrendingDown className="w-3 h-3" />
                  }
                  {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                </div>
              </div>

              {/* Stage */}
              <div className="col-span-2">
                <span className="text-xs text-muted-foreground">{token.eliminatedAt}</span>
              </div>

              {/* Action */}
              <div className="col-span-1 flex justify-end">
                <Link
                  href={`/tokens/${token.teamCode.toLowerCase()}`}
                  className="text-xs px-2 py-1 border border-border hover:bg-lime/10 hover:border-lime/40 hover:text-lime transition-colors font-mono"
                >
                  Trade
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last updated */}
      <p className="text-xs text-muted-foreground font-mono">
        Last updated: {new Date(lastUpdated).toLocaleTimeString()}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardInner />
    </DashboardLayout>
  )
}
