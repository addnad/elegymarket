"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useElegy } from "@/context/elegy-context"
import { Flame, Trophy, TrendingUp, TrendingDown } from "lucide-react"

function getGriefColor(score: number) {
  if (score >= 75) return "text-red-400"
  if (score >= 50) return "text-orange-400"
  if (score >= 25) return "text-yellow-400"
  return "text-muted-foreground"
}

function getGriefBarColor(score: number) {
  if (score >= 75) return "bg-red-400"
  if (score >= 50) return "bg-orange-400"
  if (score >= 25) return "bg-yellow-400"
  return "bg-muted"
}

function getMedalEmoji(index: number) {
  if (index === 0) return "🥇"
  if (index === 1) return "🥈"
  if (index === 2) return "🥉"
  return `#${index + 1}`
}

function LeaderboardInner() {
  const { tokens } = useElegy()
  const sorted = [...tokens].sort((a, b) => b.sentimentScore - a.sentimentScore)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Ranked by Grief Score
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Grief Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Which fanbase is suffering the most right now
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {sorted.slice(0, 3).map((token, i) => (
          <div
            key={token.teamCode}
            className={`border p-4 text-center transition-colors ${
              i === 0
                ? "border-red-400/30 bg-red-400/5"
                : "border-border bg-background"
            }`}
          >
            <p className="text-2xl mb-2">{getMedalEmoji(i)}</p>
            <p className="text-3xl mb-2">{token.flag}</p>
            <p className="font-semibold text-sm">{token.teamName}</p>
            <div className={`flex items-center justify-center gap-1 mt-2 ${getGriefColor(token.sentimentScore)}`}>
              <Flame className="w-4 h-4" />
              <span className="text-xl font-mono font-bold">{token.sentimentScore}</span>
            </div>
            <p className={`text-xs mt-1 ${getGriefColor(token.sentimentScore)}`}>
              {token.sentimentScore >= 75 ? "Peak Grief" :
               token.sentimentScore >= 50 ? "Grieving" :
               token.sentimentScore >= 25 ? "Fading" : "Moving On"}
            </p>
          </div>
        ))}
      </div>

      {/* Full Rankings */}
      <div className="border border-border">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border bg-surface">
          <span className="col-span-1 text-xs font-mono text-muted-foreground uppercase">Rank</span>
          <span className="col-span-3 text-xs font-mono text-muted-foreground uppercase">Team</span>
          <span className="col-span-4 text-xs font-mono text-muted-foreground uppercase">Grief Level</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Price</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">24h</span>
        </div>

        {sorted.map((token, i) => (
          <div
            key={token.teamCode}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors items-center"
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className="text-sm font-mono text-muted-foreground">
                {getMedalEmoji(i)}
              </span>
            </div>

            {/* Team */}
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-xl">{token.flag}</span>
              <div>
                <p className="text-sm font-medium">{token.teamName}</p>
                <p className="text-xs font-mono text-muted-foreground">{token.eliminatedAt}</p>
              </div>
            </div>

            {/* Grief Bar */}
            <div className="col-span-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface border border-border">
                  <div
                    className={`h-full ${getGriefBarColor(token.sentimentScore)} transition-all`}
                    style={{ width: `${token.sentimentScore}%` }}
                  />
                </div>
                <span className={`text-xs font-mono w-8 text-right ${getGriefColor(token.sentimentScore)}`}>
                  {token.sentimentScore}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2">
              <p className="text-sm font-mono">${token.priceUSD.toFixed(3)}</p>
            </div>

            {/* 24h */}
            <div className="col-span-2">
              <div className={`flex items-center gap-1 text-xs font-mono ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {token.change24h >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {token.change24h >= 0 ? "+" : ""}{token.change24h}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <LeaderboardInner />
    </DashboardLayout>
  )
}
