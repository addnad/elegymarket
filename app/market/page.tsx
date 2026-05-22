"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useElegy } from "@/context/elegy-context"
import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts"
import { Flame, TrendingUp, TrendingDown } from "lucide-react"

function getGriefColor(score: number) {
  if (score >= 75) return "#f87171"
  if (score >= 50) return "#fb923c"
  if (score >= 25) return "#facc15"
  return "#6b7280"
}

function generatePriceHistory(token: any) {
  return Array.from({ length: 24 }, (_, i) => {
    const base = token.sparkline[0]
    const current = token.price
    const progress = i / 23
    const price = base + (current - base) * progress + (Math.random() - 0.5) * 0.00002
    return {
      hour: `${24 - i}h ago`,
      price: +Math.max(0.0001, price).toFixed(6),
      priceUSD: +(price * 3000).toFixed(4),
    }
  }).reverse()
}

function MarketInner() {
  const { tokens } = useElegy()
  const [selectedCode, setSelectedCode] = useState(tokens[0]?.teamCode || "ENG")
  const selected = tokens.find(t => t.teamCode === selectedCode) || tokens[0]
  const priceHistory = generatePriceHistory(selected)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border border-border px-3 py-2 text-xs font-mono">
          <p className="text-muted-foreground">{payload[0].payload.hour}</p>
          <p className="text-foreground">${payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Price Charts
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Market</h1>
        <p className="text-sm text-muted-foreground mt-1">
          24-hour price history for all active grief tokens
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Token Selector */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
            Select Token
          </p>
          {tokens.map(token => (
            <button
              key={token.teamCode}
              onClick={() => setSelectedCode(token.teamCode)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 border transition-colors text-left ${
                selectedCode === token.teamCode
                  ? "border-lime/40 bg-lime/5 text-foreground"
                  : "border-border hover:bg-surface-hover text-muted-foreground"
              }`}
            >
              <span className="text-xl">{token.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{token.teamName}</p>
                <p className="text-xs font-mono text-muted-foreground">${token.priceUSD.toFixed(3)}</p>
              </div>
              <Flame className="w-3 h-3 flex-shrink-0" style={{ color: getGriefColor(token.sentimentScore) }} />
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3">
          {selected && (
            <>
              {/* Selected Token Header */}
              <div className="flex items-center justify-between mb-6 p-4 border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.flag}</span>
                  <div>
                    <p className="font-semibold">{selected.teamName}</p>
                    <p className="text-xs font-mono text-muted-foreground">GRIEF_{selected.teamCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold">${selected.priceUSD.toFixed(3)}</p>
                  <div className={`flex items-center justify-end gap-1 text-sm font-mono ${selected.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {selected.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {selected.change24h >= 0 ? "+" : ""}{selected.change24h}% 24h
                  </div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="border border-border p-4 mb-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">
                  Price (USD) — Last 24 Hours
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      interval={5}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickFormatter={(v) => `$${v}`}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="priceUSD"
                      stroke={getGriefColor(selected.sentimentScore)}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Grief Score", value: `${selected.sentimentScore}/100` },
                  { label: "Supply", value: `${selected.supply} tokens` },
                  { label: "Eliminated", value: selected.eliminatedAt },
                ].map(stat => (
                  <div key={stat.label} className="border border-border p-3">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-sm font-mono font-medium">{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MarketPage() {
  return (
    <DashboardLayout>
      <MarketInner />
    </DashboardLayout>
  )
}
