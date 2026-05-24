"use client"

import { useState } from "react"
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi"
import { formatEther } from "viem"
import { X, Flame, TrendingUp, TrendingDown, Loader2, CheckCircle, AlertCircle, Plus, Minus } from "lucide-react"
import { xlayerMainnet } from "@/lib/web3"
import { CURVE_ADDRESS } from "@/lib/contracts"

const BONDING_CURVE_ABI = [
  {
    name: "getBuyPriceFor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getSellPriceFor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "teamCode", type: "string" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "teamCode", type: "string" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "sell",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "teamCode", type: "string" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const

interface TradeModalProps {
  token: {
    teamCode: string
    teamName: string
    flag: string
    sentimentScore: number
    priceUSD: number
    price: number
    change24h: number
  }
  onClose: () => void
}

function getGriefColor(score: number) {
  if (score >= 75) return "text-red-400"
  if (score >= 50) return "text-orange-400"
  if (score >= 25) return "text-yellow-400"
  return "text-muted-foreground"
}

export function TradeModal({ token, onClose }: TradeModalProps) {
  const [tab, setTab] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState(1)
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const isWrongNetwork = isConnected && chainId !== xlayerMainnet.id

  const { data: buyPriceBigInt, isLoading: buyLoading } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getBuyPriceFor",
    args: [token.teamCode, BigInt(amount)],
    chainId: xlayerMainnet.id,
    query: { refetchInterval: 10_000 },
  })

  const { data: sellPriceBigInt, isLoading: sellLoading } = useReadContract({
    address: CURVE_ADDRESS,
    abi: BONDING_CURVE_ABI,
    functionName: "getSellPriceFor",
    args: [token.teamCode, BigInt(amount)],
    chainId: xlayerMainnet.id,
    query: { refetchInterval: 10_000 },
  })

  const { data: balance } = useBalance({ address, chainId: xlayerMainnet.id })
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const buyValue = buyPriceBigInt ? buyPriceBigInt + (buyPriceBigInt * 2n / 100n) : undefined
  const buyPriceDisplay = buyPriceBigInt ? parseFloat(formatEther(buyPriceBigInt)).toFixed(6) : "..."
  const sellPriceDisplay = sellPriceBigInt ? parseFloat(formatEther(sellPriceBigInt)).toFixed(6) : "..."
  const pricePerToken = buyPriceBigInt ? parseFloat(formatEther(buyPriceBigInt / BigInt(amount))).toFixed(6) : "..."

  function handleBuy() {
    if (!buyValue) return
    writeContract({
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "buy",
      args: [token.teamCode, BigInt(amount)],
      value: buyValue,
      gas: BigInt(500000),
      chainId: xlayerMainnet.id,
    })
  }

  function handleSell() {
    writeContract({
      address: CURVE_ADDRESS,
      abi: BONDING_CURVE_ABI,
      functionName: "sell",
      args: [token.teamCode, BigInt(amount)],
      gas: BigInt(500000),
      chainId: xlayerMainnet.id,
    })
  }

  function AmountSelector() {
    return (
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">Amount</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(a => Math.max(1, a - 1))}
            className="w-7 h-7 border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-mono font-bold w-4 text-center">{amount}</span>
          <button
            onClick={() => setAmount(a => Math.min(5, a + 1))}
            className="w-7 h-7 border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <span className="text-xs text-muted-foreground">max 5</span>
        </div>
      </div>
    )
  }

  function renderSuccess() {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
        <p className="text-base font-medium text-green-400">
          {tab === "buy" ? `Bought ${amount} token${amount > 1 ? "s" : ""}` : `Sold ${amount} token${amount > 1 ? "s" : ""}`}
        </p>
        {txHash && (
          <p className="text-xs font-mono text-muted-foreground break-all px-2">{txHash}</p>
        )}
        {txHash && (
          <button
            onClick={() => window.open("https://www.oklink.com/xlayer/tx/" + txHash, "_blank")}
            className="text-xs text-lime underline block mx-auto"
          >
            View on explorer
          </button>
        )}
        <button
          onClick={() => { reset(); onClose() }}
          className="mt-2 w-full py-2 border border-border hover:bg-surface-hover transition-colors text-sm"
        >
          Close
        </button>
      </div>
    )
  }

  function renderWrongNetwork() {
    return (
      <div className="text-center py-6 space-y-3">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto" />
        <p className="text-sm font-medium">Wrong Network</p>
        <p className="text-xs text-muted-foreground">Switch to X Layer to trade</p>
        <button
          onClick={() => switchChain({ chainId: xlayerMainnet.id })}
          className="w-full py-2 border border-lime/40 text-lime hover:bg-lime/10 transition-colors text-sm"
        >
          Switch to X Layer
        </button>
      </div>
    )
  }

  function renderBuy() {
    return (
      <div className="space-y-3">
        <AmountSelector />
        <div className="bg-surface border border-border p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You pay</span>
            <span className="font-mono">{buyPriceDisplay} OKB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Per token</span>
            <span className="font-mono text-muted-foreground">{pricePerToken} OKB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You receive</span>
            <span className="font-mono">{amount} GRIEF_{token.teamCode}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="font-mono">5%</span>
          </div>
        </div>
        {balance && (
          <p className="text-xs text-muted-foreground">
            Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} OKB
          </p>
        )}
        <button
          onClick={handleBuy}
          disabled={isPending || isConfirming || buyLoading || !buyValue}
          className="w-full py-3 bg-lime/10 border border-lime/40 text-lime hover:bg-lime/20 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(isPending || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : `Buy ${amount} GRIEF_${token.teamCode}`}
        </button>
      </div>
    )
  }

  function renderSell() {
    return (
      <div className="space-y-3">
        <AmountSelector />
        <div className="bg-surface border border-border p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You sell</span>
            <span className="font-mono">{amount} GRIEF_{token.teamCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You receive</span>
            <span className="font-mono">{sellPriceDisplay} OKB</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border pt-2">
            <span className="text-muted-foreground">Sell spread</span>
            <span className="font-mono">5%</span>
          </div>
        </div>
        <button
          onClick={handleSell}
          disabled={isPending || isConfirming || sellLoading}
          className="w-full py-3 bg-red-400/10 border border-red-400/30 text-red-400 hover:bg-red-400/20 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(isPending || isConfirming) && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : `Sell ${amount} GRIEF_${token.teamCode}`}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{token.flag}</span>
            <div>
              <p className="font-semibold">{token.teamName}</p>
              <p className="text-xs font-mono text-muted-foreground">GRIEF_{token.teamCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-border">
          <div className="p-3 border-r border-border">
            <p className="text-xs text-muted-foreground mb-1">Grief Score</p>
            <div className={"flex items-center gap-1 " + getGriefColor(token.sentimentScore)}>
              <Flame className="w-3 h-3" />
              <span className="font-mono font-bold">{token.sentimentScore}</span>
            </div>
          </div>
          <div className="p-3 border-r border-border">
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="font-mono font-bold text-sm">${token.priceUSD.toFixed(3)}</p>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-1">24h</p>
            <div className={"flex items-center gap-1 text-sm font-mono " + (token.change24h >= 0 ? "text-green-400" : "text-red-400")}>
              {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {token.change24h >= 0 ? "+" : ""}{token.change24h}%
            </div>
          </div>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => { setTab("buy"); setAmount(1); reset() }}
            className={"flex-1 py-3 text-sm font-medium transition-colors " + (tab === "buy" ? "text-lime border-b-2 border-lime" : "text-muted-foreground hover:text-foreground")}
          >
            Buy
          </button>
          <button
            onClick={() => { setTab("sell"); setAmount(1); reset() }}
            className={"flex-1 py-3 text-sm font-medium transition-colors " + (tab === "sell" ? "text-lime border-b-2 border-lime" : "text-muted-foreground hover:text-foreground")}
          >
            Sell
          </button>
        </div>

        <div className="p-4">
          {isSuccess && renderSuccess()}
          {!isSuccess && !isConnected && (
            <p className="text-sm text-muted-foreground text-center py-6">Connect your wallet to trade</p>
          )}
          {!isSuccess && isConnected && isWrongNetwork && renderWrongNetwork()}
          {!isSuccess && isConnected && !isWrongNetwork && tab === "buy" && renderBuy()}
          {!isSuccess && isConnected && !isWrongNetwork && tab === "sell" && renderSell()}
          {writeError && !isSuccess && (
            <p className="text-xs text-red-400 mt-3 p-2 bg-red-400/10 border border-red-400/20 break-all">
              {writeError.message.slice(0, 200)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
