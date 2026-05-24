"use client"

import { useElegy } from "@/context/elegy-context"

export function usePortfolio() {
  const { holdings, totalValueUSD, totalValueOKB, totalPnlOKB, isPortfolioLoading } = useElegy()
  return { holdings, totalValueUSD, totalValueOKB, totalPnlOKB, isLoading: isPortfolioLoading }
}
