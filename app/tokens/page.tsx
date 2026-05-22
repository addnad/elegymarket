"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useElegy } from "@/context/elegy-context"
import { TradeModal } from "@/components/dashboard/trade-modal"
import { useState } from "react"
import { Flame, TrendingUp, TrendingDown, Users, BarChart2 } from "lucide-react"
import Link from "next/link"

function getGriefColor(score: number) {
  if (score >= 75) return "text-red-400"
  if (score >= 50) return "text-orange-400"
  if (score >= 25) return "text-yellow-400"
  return "text-muted-foreground"
}

function getGriefBg(score: number) {
  if (score >= 75) return "bg-red-400/10 border-red-400/20"
  if (score >= 50) return "bg-orange-400/10 border-orange-400/20"
  if (score >= 25) return "bg-yellow-400/10 border-yellow-400/20"
  return "bg-surface border-border"
}

function getGriefLabel(score: number) {
  if (score >= 75) return "Peak Grief"
  if (score >= 50) return "Grieving"
  if (score >= 25) return "Fading"
  return "Moving On"
}

function TokensInner() {
  const { tokens } = useElegy()
  const [selectedToken, setSelectedToken] = useState<any>(null)
  const sorted = [...tokens].sort((a, b) => b.sentimentScore - a.sentimentScore)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {tokens.length} Active Tokens
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Grief Tokens</h1>
        <p className="text-sm text-muted-foreground mt-1">
          One token per eliminated team. Price moves with sentiment.
        </p>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((token) => (
          <div
            key={token.teamCode}
            className="border border-border bg-background hover:bg-surface-hover transition-colors"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{token.flag}</span>
                <div>
                  <p className="font-semibold">{token.teamName}</p>
                  <p className="text-xs font-mono text-muted-foreground">GRIEF_{token.teamCode}</p>
                </div>
              </div>
              <div className={`px-2 py-1 border text-xs font-mono ${getGriefBg(token.sentimentScore)} ${getGriefColor(token.sentimentScore)}`}>
                {getGriefLabel(token.sentimentScore)}
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Grief Score</p>
                <div className="flex items-center gap-1.5">
                  <Flame className={`w-4 h-4 ${getGriefColor(token.sentimentScore)}`} />
                  <span className={`text-xl font-mono font-bold ${getGriefColor(token.sentimentScore)}`}>
                    {token.sentimentScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="mt-2 h-1 bg-surface border border-border">
                  <div
                    className={`h-full transition-all ${
                      token.sentimentScore >= 75 ? "bg-red-400" :
                      token.sentimentScore >= 50 ? "bg-orange-400" :
                      token.sentimentScore >= 25 ? "bg-yellow-400" : "bg-muted"
                    }`}
                    style={{ width: `${token.sentimentScore}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                <p className="text-xl font-mono font-bold">${token.priceUSD.toFixed(3)}</p>
                <div className={`flex items-center gap-1 text-xs font-mono mt-1 ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {token.change24h >= 0 ? "+" : ""}{token.change24h}% 24h
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Tokens Sold</p>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-mono">{token.supply}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Eliminated</p>
                <p className="text-sm font-mono">{token.eliminatedAt}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => setSelectedToken(token)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-lime/10 border border-lime/30 text-lime hover:bg-lime/20 transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                Trade
              </button>
              <Link
                href={`/market?token=${token.teamCode}`}
                className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-border hover:bg-surface-hover transition-colors text-muted-foreground"
              >
                Chart
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Trade Modal */}
      {selectedToken && (
        <TradeModal
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  )
}

export default function TokensPage() {
  return (
    <DashboardLayout>
      <TokensInner />
    </DashboardLayout>
  )
}
