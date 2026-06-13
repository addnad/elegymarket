"use client"

import { useEffect, useRef } from "react"
import { useAccount } from "wagmi"

export function PendoInitializer() {
  const { address, isConnected, chainId } = useAccount()
  const initializedRef = useRef(false)
  const prevAddressRef = useRef<string | undefined>(undefined)

  // Initialize Pendo once on mount with anonymous visitor
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    pendo.initialize({
      visitor: { id: '' }
    })
  }, [])

  // Identify when wallet connects, clear session when wallet disconnects
  useEffect(() => {
    if (!initializedRef.current) return

    if (address) {
      pendo.identify({
        visitor: {
          id: address,
          walletAddress: address,
          isConnected: isConnected,
          chainId: chainId
        }
      })
    } else if (prevAddressRef.current) {
      pendo.clearSession()
    }

    prevAddressRef.current = address
  }, [address, isConnected, chainId])

  return null
}
