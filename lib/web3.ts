import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { okxWallet, metaMaskWallet, rainbowWallet } from "@rainbow-me/rainbowkit/wallets";
import { defineChain } from "viem";

export const xlayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testrpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer-test" },
  },
  testnet: true,
});

export const xlayerMainnet = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer" },
  },
});

export const config = getDefaultConfig({
  appName: "Elegy",
  projectId: "elegy_grief_index",
  wallets: [
    {
      groupName: "Recommended",
      wallets: [okxWallet, metaMaskWallet, rainbowWallet],
    },
  ],
  chains: [xlayerTestnet, xlayerMainnet],
  ssr: true,
});
