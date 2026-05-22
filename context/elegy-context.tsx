"use client"

import React, { createContext, useContext } from "react"
import { useGriefTokens } from "@/hooks/use-grief-tokens"

export interface GriefToken {
  teamCode: string
  teamName: string
  flag: string
  sentimentScore: number
  price: number
  priceUSD: number
  supply: number
  change24h: number
  sparkline: number[]
  eliminatedAt: string
  active: boolean
}

interface ElegyState {
  tokens: GriefToken[]
  totalVolume: number
  totalTraders: number
  isLoading: boolean
  refetch: () => void
}

const ElegyContext = createContext<ElegyState | null>(null)

export function ElegyProvider({ children }: { children: React.ReactNode }) {
  const { tokens, isLoading, refetch } = useGriefTokens()

  const totalVolume = tokens.reduce((sum, t) => sum + t.supply * t.priceUSD, 0)
  const totalTraders = tokens.reduce((sum, t) => sum + t.supply, 0)

  return (
    <ElegyContext.Provider value={{
      tokens,
      totalVolume,
      totalTraders,
      isLoading,
      refetch,
    }}>
      {children}
    </ElegyContext.Provider>
  )
}

export function useElegy() {
  const ctx = useContext(ElegyContext)
  if (!ctx) throw new Error("useElegy must be used within ElegyProvider")
  return ctx
}
