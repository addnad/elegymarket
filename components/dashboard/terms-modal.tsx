"use client"

import { useEffect, useState } from "react"

export function TermsModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem("elegy-terms-accepted")
    if (!accepted) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem("elegy-terms-accepted", "true")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-background border border-border w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 bg-lime" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Before you enter
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Terms of Use</h2>
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Elegy is an experimental protocol built on X Layer Mainnet. By entering, you acknowledge and agree to the following:
          </p>

          <div>
            <p className="text-foreground font-semibold mb-1">Not Financial Advice</p>
            <p>Nothing on this platform constitutes financial, investment, or trading advice. Grief Tokens have no guaranteed value. You may lose all funds you invest.</p>
          </div>

          <div>
            <p className="text-foreground font-semibold mb-1">Smart Contract Risk</p>
            <p>Elegy's smart contracts are experimental and unaudited. Bugs or exploits could result in permanent loss of funds. Use only what you can afford to lose.</p>
          </div>

          <div>
            <p className="text-foreground font-semibold mb-1">Irreversible Transactions</p>
            <p>All blockchain transactions are final and cannot be reversed. There are no refunds.</p>
          </div>

          <div>
            <p className="text-foreground font-semibold mb-1">Jurisdictional Responsibility</p>
            <p>It is your responsibility to ensure that using this platform is legal in your jurisdiction. Elegy does not operate in restricted regions and makes no representations about regulatory compliance.</p>
          </div>

          <div>
            <p className="text-foreground font-semibold mb-1">Age Requirement</p>
            <p>You must be at least 18 years old to use this platform.</p>
          </div>

          <div>
            <p className="text-foreground font-semibold mb-1">No Guarantees</p>
            <p>Elegy is provided as-is. We make no guarantees about uptime, accuracy of sentiment scores, or protocol continuity beyond the 2026 FIFA World Cup.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex flex-col gap-3">
          <button
            onClick={accept}
            className="w-full bg-lime text-background font-semibold py-3 text-sm hover:bg-lime/90 transition-colors"
          >
            I Understand — Enter Elegy
          </button>
          <p className="text-xs text-muted-foreground text-center">
            By continuing you agree to these terms.
          </p>
        </div>

      </div>
    </div>
  )
}
