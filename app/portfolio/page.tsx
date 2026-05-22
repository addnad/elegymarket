"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAccount } from "wagmi"
import { TrendingUp, TrendingDown, Wallet, Loader2 } from "lucide-react"
import Link from "next/link"

function PortfolioInner() {
  const { address, isConnected } = useAccount()
  const { holdings, totalValueUSD, totalValueOKB, totalPnlOKB, isLoading } = usePortfolio()

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

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
          <p className="text-2xl font-mono font-bold">${totalValueUSD.toFixed(3)}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">{totalValueOKB.toFixed(6)} OKB</p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
          <p className={`text-2xl font-mono font-bold ${totalPnlOKB >= 0 ? "text-green-400" : "text-red-400"}`}>
            {totalPnlOKB >= 0 ? "+" : ""}{totalPnlOKB.toFixed(6)} OKB
          </p>
        </div>
        <div className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-1">Holdings</p>
          <p className="text-2xl font-mono font-bold">{holdings.length}</p>
          <p className="text-xs text-muted-foreground mt-1">tokens</p>
        </div>
      </div>

      {/* Holdings Table */}
      {holdings.length === 0 ? (
        <div className="border border-border p-12 text-center">
          <p className="text-muted-foreground mb-3">No holdings yet</p>
          <Link href="/tokens" className="text-sm text-lime hover:underline">
            Buy your first grief token
          </Link>
        </div>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-border bg-surface">
            <span className="col-span-3 text-xs font-mono text-muted-foreground uppercase">Token</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Amount</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Sell Price</span>
            <span className="col-span-2 text-xs font-mono text-muted-foreground uppercase">Value</span>
            <span className="col-span-3 text-xs font-mono text-muted-foreground uppercase">P&L</span>
          </div>

          {holdings.map((h) => (
            <div
              key={h.teamCode}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-hover transition-colors items-center"
            >
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-xl">{h.flag}</span>
                <div>
                  <p className="text-sm font-medium">{h.teamName}</p>
                  <p className="text-xs font-mono text-muted-foreground">GRIEF_{h.teamCode}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">{h.amount.toFixed(0)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">{h.sellPrice.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground font-mono">OKB</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-mono">{h.valueOKB.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground font-mono">${h.valueUSD.toFixed(3)}</p>
              </div>
              <div className="col-span-3">
                <div className={`flex items-center gap-1 text-sm font-mono ${h.pnlOKB >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {h.pnlOKB >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {h.pnlOKB >= 0 ? "+" : ""}{h.pnlPct.toFixed(1)}%
                </div>
                <p className={`text-xs font-mono ${h.pnlOKB >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {h.pnlOKB >= 0 ? "+" : ""}{h.pnlOKB.toFixed(6)} OKB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
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
