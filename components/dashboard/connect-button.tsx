"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useDisconnect } from "wagmi";

interface WalletConnectButtonProps {
  compact?: boolean;
}

export function WalletConnectButton({ compact = false }: WalletConnectButtonProps) {
  const { disconnect } = useDisconnect();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-lime/40 text-lime hover:bg-lime/10 transition-colors"
              >
                <div className="w-2 h-2 rounded-full border border-lime/60" />
                <span>{compact ? "Connect" : "Connect Wallet"}</span>
              </button>
            ) : chain?.unsupported ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Wrong Network</span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="px-2 py-1.5 text-xs text-muted-foreground border border-border hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border hover:bg-surface-hover transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-lime lime-glow-sm" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {account.displayName}
                  </span>
                  {!compact && (
                    <span className="text-xs text-muted-foreground border-l border-border pl-2">
                      {chain.name}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => disconnect()}
                  className="px-2 py-1.5 text-xs text-muted-foreground border border-border hover:text-foreground hover:bg-surface-hover transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
