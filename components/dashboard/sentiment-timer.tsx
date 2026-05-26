"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const ORACLE = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443"
const RPC = "https://rpc.xlayer.tech"
const TOPIC = "0xde3d5f6b3b69b0a9a173aec788a582804b4166f35412fdbb5e861e5b45ffa42d"
const FALLBACK_TX = "0x3ee5c8ce3b17869f5dd666227a9997c2b8c5569b3478005c4fcb6c269279c66c"

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
  const [lastTx, setLastTx] = useState<string>(FALLBACK_TX)

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getSecondsToNextUpdate()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchLastTx() {
      try {
        const blockRes = await fetch(RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        })
        const blockData = await blockRes.json()
        let toBlock = parseInt(blockData.result, 16)

        for (let i = 0; i < 500; i++) {
          const fromBlock = toBlock - 99
          const res = await fetch(RPC, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "eth_getLogs",
              params: [{ address: ORACLE, topics: [TOPIC], fromBlock: "0x" + fromBlock.toString(16), toBlock: "0x" + toBlock.toString(16) }],
              id: 2,
            }),
          })
          const data = await res.json()
          if (data.result?.length > 0) {
            setLastTx(data.result[data.result.length - 1].transactionHash)
            return
          }
          toBlock = fromBlock - 1
        }
      } catch (e) {}
    }
    fetchLastTx()
  }, [])

  return (
    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-lime rounded-full animate-pulse" />
        <span>Next update in <span className="text-lime">{formatCountdown(countdown)}</span></span>
      </div>
      <span className="text-border">·</span>
      <Link
        href={`https://www.oklink.com/x-layer/evm/tx/${lastTx}`}
        target="_blank"
        className="hover:text-lime transition-colors underline underline-offset-2"
      >
        Last oracle tx ↗
      </Link>
    </div>
  )
}
