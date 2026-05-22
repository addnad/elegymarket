"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useAccount } from "wagmi"

export default function SettingsPage() {
  const { address, isConnected } = useAccount()

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Network and wallet configuration</p>
        </div>

        <div className="max-w-lg space-y-4">
          <div className="border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Network</p>
            <div className="space-y-2">
              {[
                { label: "Network",    value: "X Layer Testnet" },
                { label: "Chain ID",   value: "1952"            },
                { label: "RPC",        value: "testrpc.xlayer.tech" },
                { label: "Explorer",   value: "oklink.com/xlayer-test" },
                { label: "Gas Token",  value: "OKB" },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border p-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Contracts</p>
            <div className="space-y-2">
              {[
                { label: "Oracle",       value: process.env.NEXT_PUBLIC_SENTIMENT_ORACLE },
                { label: "Bonding Curve",value: process.env.NEXT_PUBLIC_BONDING_CURVE    },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm gap-4">
                  <span className="text-muted-foreground flex-shrink-0">{row.label}</span>
                  <span className="font-mono text-xs truncate text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {isConnected && (
            <div className="border border-border p-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Wallet</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address</span>
                <span className="font-mono text-xs">{address}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
