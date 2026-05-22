"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useElegy } from "@/context/elegy-context"
import { useAccount } from "wagmi"
import { Flame, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import Link from "next/link"

// Mock portfolio holdings — will be replaced with on-chain balance reads
const MOCK_HOLDINGS = [
  { teamCode: "ENG", amount: 3, avgBuyPrice: 0.00018 },
  { teamCode: "BRA", amount: 1, avgBuyPrice: 0.000165 },
]

function getGriefColor(score: number) {
  if (score >= 75) return "text-red-400"
  if (score >= 50) return "text-orange-400"
  if (score >= 25) return "text-yellow-400"
  return "text-muted-foreground"
}

function PortfolioInner() {
  const { tokens } = useElegy()
  const { address, isConnected } = useAccount()

  const holdings = MOCK_HOLDINGS.map(h => {
    const token = tokens.find(t => t.teamCode === h.teamCode)
    if (!token) return null
    const currentValue = h.amount * token.priceUSD
    const costBasis = h.amount * h.avgBuyPrice * 3000
    const pnl = currentValue - costBasis
    const pnlPct = ((currentValue - costBasis) / costBasis) * 100
    return { ...h, token, currentValue, costBasis, pnl, pnlPct }
  }).filter(Boolean) as any[]

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalPnl = holdings.reduce((sum, h) => sum + h.pnl, 0)
  const totalPnlPct = holdings.reduce((sum, h) => sum + h.costBasis, 0) > 0
    ? (totalPnl / holdings.reduce((sum, h) => sum + h.costBasis, 0)) * 100
    : 0

  if (!isConnected) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Your grief token holdings and P&L</p>
        </div>
        <div className="border border-border p-12 flex flex-col items-center justify-center text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Connect your wallet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your wallet to view your grief token holdings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-lime pulse-live" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-sm text-muted-foreground mt-1">Your grief token holdings and P&L</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Value</p>
          <p className="text-2xl font-mono font-bold">${totalValue.toFixed(3)}</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-2xl font-mono font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(3)}
          </p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Return</p>
          <div className={`flex items-center gap-1 ${totalPnlPct >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnlPct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <p className="text-2xl font-mono font-bold">
              {totalPnlPct >= 0 ? "+" : ""}{totalPnlPct.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="border border-border">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border bg-surface">
          <span className="col-span-3 text-xs font-mono text-muted-foreground uppercase">Token</span>
          <span className="col-span-1 text-xs font-mono text-muted-foreground uppercase">Amt</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Avg Buy</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Current</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Value</span>
          <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">P&L</span>
        </div>

        {holdings.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No holdings yet.{" "}
            <Link href="/tokens" className="text-lime hover:underline">Buy your first grief token →</Link>
          </div>
        ) : (
          holdings.map((h) => (
            <div
              key={h.teamCode}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors items-center"
            >
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-xl">{h.token.flag}</span>
                <div>
                  <p className="text-sm font-medium">{h.token.teamName}</p>
                  <p className="text-xs font-mono text-muted-foreground">GRIEF_{h.teamCode}</p>
                </div>
              </div>
              <div className="col-span-1">
                <p className="text-sm font-mono">{h.amount}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">${(h.avgBuyPrice * 3000).toFixed(3)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">${h.token.priceUSD.toFixed(3)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">${h.currentValue.toFixed(3)}</p>
              </div>
              <div className="col-span-2">
                <div className={`flex items-center gap-1 text-xs font-mono ${h.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {h.pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {h.pnl >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <DashboardLayout>
      <PortfolioInner />
    </DashboardLayout>
  )
}
