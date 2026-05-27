"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const ORACLE = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443"
const ORACLE_EXPLORER = `https://www.oklink.com/x-layer/evm/address/${ORACLE}`

function getSecondsToNextUpdate() {
  const now = new Date()
  const seconds = now.getMinutes() * 60 + now.getSeconds()
  return 1800 - (seconds % 1800)
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function SentimentTimer() {
  const [countdown, setCountdown] = useState(getSecondsToNextUpdate())

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getSecondsToNextUpdate()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse" />
        <span>Next update in <span className="text-lime">{formatCountdown(countdown)}</span></span>
      </div>
      <span className="text-border">·</span>
      <Link
        href={ORACLE_EXPLORER}
        target="_blank"
        className="hover:text-lime transition-colors underline underline-offset-2"
      >
        Oracle txns ↗
      </Link>
    </div>
  )
}
