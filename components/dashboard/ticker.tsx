"use client"

import { useEffect, useRef, useState } from "react"
import { createPublicClient, http, parseAbiItem, formatEther } from "viem"
import { xlayerMainnet } from "@/lib/web3"
import { TrendingUp, TrendingDown } from "lucide-react"

const FLAG_MAP: Record<string, string> = {
  ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",FRA:"🇫🇷",GER:"🇩🇪",ESP:"🇪🇸",POR:"🇵🇹",NED:"🇳🇱",BEL:"🇧🇪",CRO:"🇭🇷",
  SUI:"🇨🇭",AUT:"🇦🇹",NOR:"🇳🇴",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",SWE:"🇸🇪",TUR:"🇹🇷",BIH:"🇧🇦",CZE:"🇨🇿",
  ALG:"🇩🇿",CPV:"🇨🇻",EGY:"🇪🇬",GHA:"🇬🇭",CIV:"🇨🇮",MAR:"🇲🇦",SEN:"🇸🇳",RSA:"🇿🇦",
  TUN:"🇹🇳",COD:"🇨🇩",AUS:"🇦🇺",IRN:"🇮🇷",JPN:"🇯🇵",JOR:"🇯🇴",QAT:"🇶🇦",KSA:"🇸🇦",
  KOR:"🇰🇷",UZB:"🇺🇿",IRQ:"🇮🇶",ARG:"🇦🇷",BRA:"🇧🇷",COL:"🇨🇴",ECU:"🇪🇨",PAR:"🇵🇾",
  URU:"🇺🇾",USA:"🇺🇸",CAN:"🇨🇦",MEX:"🇲🇽",CUW:"🇨🇼",HAI:"🇭🇹",PAN:"🇵🇦",NZL:"🇳🇿",
}

const CURVE_ADDRESS = process.env.NEXT_PUBLIC_BONDING_CURVE as `0x${string}`
const BUY_EVENT  = parseAbiItem("event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost)")
const SELL_EVENT = parseAbiItem("event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout)")

interface TickerEvent {
  id: string
  type: "buy" | "sell"
  teamCode: string
  flag: string
  amount: number
  cost: string
  txHash: string
}

const SEED: TickerEvent[] = [
  { id: "s1", type: "buy",  teamCode: "BRA", flag: "🇧🇷", amount: 2, cost: "0.000201", txHash: "" },
  { id: "s2", type: "buy",  teamCode: "ARG", flag: "🇦🇷", amount: 1, cost: "0.000100", txHash: "" },
  { id: "s3", type: "sell", teamCode: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", amount: 1, cost: "0.000095", txHash: "" },
  { id: "s4", type: "buy",  teamCode: "FRA", flag: "🇫🇷", amount: 3, cost: "0.000302", txHash: "" },
  { id: "s5", type: "buy",  teamCode: "MAR", flag: "🇲🇦", amount: 2, cost: "0.000201", txHash: "" },
  { id: "s6", type: "sell", teamCode: "BRA", flag: "🇧🇷", amount: 1, cost: "0.000095", txHash: "" },
  { id: "s7", type: "buy",  teamCode: "ARG", flag: "🇦🇷", amount: 2, cost: "0.000201", txHash: "" },
]

export function LiveTicker() {
  const [events, setEvents] = useState<TickerEvent[]>(SEED)
  const trackRef = useRef<HTMLDivElement>(null)
  const posRef   = useRef(0)
  const rafRef   = useRef<number>(0)
  const pauseRef = useRef(false)

  // Animate with requestAnimationFrame for smooth scroll
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let lastTime = 0
    const speed = 0.04 // px per ms

    function animate(now: number) {
      if (!pauseRef.current) {
        const delta = lastTime ? now - lastTime : 0
        posRef.current += speed * delta
        const half = track!.scrollWidth / 2
        if (posRef.current >= half) posRef.current -= half
        track!.style.transform = `translateX(-${posRef.current}px)`
      }
      lastTime = now
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [events])

  // Fetch real on-chain events
  useEffect(() => {
    const client = createPublicClient({
      chain: xlayerMainnet,
      transport: http("https://rpc.xlayer.tech"),
    })

    async function fetchEvents() {
      try {
        const block = await client.getBlockNumber()
        const fromBlock = block > 500n ? block - 500n : 0n

        const [buys, sells] = await Promise.all([
          client.getLogs({ address: CURVE_ADDRESS, event: BUY_EVENT,  fromBlock }),
          client.getLogs({ address: CURVE_ADDRESS, event: SELL_EVENT, fromBlock }),
        ])

        const parsed: TickerEvent[] = [
          ...buys.map(log => ({
            id: log.transactionHash + "b",
            type: "buy" as const,
            teamCode: log.args.teamCode || "",
            flag: FLAG_MAP[log.args.teamCode || ""] || "🏳️",
            amount: Number(log.args.amount || 1n),
            cost: parseFloat(formatEther(log.args.totalCost || 0n)).toFixed(6),
            txHash: log.transactionHash,
          })),
          ...sells.map(log => ({
            id: log.transactionHash + "s",
            type: "sell" as const,
            teamCode: log.args.teamCode || "",
            flag: FLAG_MAP[log.args.teamCode || ""] || "🏳️",
            amount: Number(log.args.amount || 1n),
            cost: parseFloat(formatEther(log.args.totalPayout || 0n)).toFixed(6),
            txHash: log.transactionHash,
          })),
        ]

        if (parsed.length >= 3) setEvents(parsed)
      } catch (e) {
        console.error("[ticker]", e)
      }
    }

    fetchEvents()
    const interval = setInterval(fetchEvents, 20_000)
    return () => clearInterval(interval)
  }, [])

  // Duplicate for seamless loop
  const looped = [...events, ...events]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-9 bg-background/95 backdrop-blur border-t border-border z-40 overflow-hidden flex items-center select-none"
      onMouseEnter={() => { pauseRef.current = true }}
      onMouseLeave={() => { pauseRef.current = false }}
    >
      {/* Live badge */}
      <div className="flex items-center gap-1.5 px-3 border-r border-border h-full flex-shrink-0 bg-background/95">
        <div className="w-1.5 h-1.5 rounded-full bg-lime pulse-live" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Live</span>
      </div>

      {/* Scrolling strip */}
      <div className="flex-1 overflow-hidden relative">
        <div ref={trackRef} className="flex gap-0 items-center will-change-transform">
          {looped.map((ev, i) => (
            <button
              key={ev.id + i}
              onClick={() => ev.txHash && window.open(
                "https://www.oklink.com/xlayer/tx/" + ev.txHash,
                "_blank"
              )}
              className={
                "flex items-center gap-1.5 flex-shrink-0 px-4 h-9 transition-opacity border-r border-border/30 " +
                (ev.txHash ? "cursor-pointer hover:bg-surface-hover" : "cursor-default")
              }
            >
              <span className="text-sm leading-none">{ev.flag}</span>
              <span className="text-xs font-mono text-muted-foreground">GRIEF_{ev.teamCode}</span>
              {ev.type === "buy" ? (
                <span className="flex items-center gap-1 text-xs font-mono text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  BUY {ev.amount}x
                  <span className="text-muted-foreground">· {ev.cost} OKB</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-mono text-red-400">
                  <TrendingDown className="w-3 h-3" />
                  SELL {ev.amount}x
                  <span className="text-muted-foreground">· {ev.cost} OKB</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
