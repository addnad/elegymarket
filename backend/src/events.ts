import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const CURVE = process.env.NEXT_PUBLIC_BONDING_CURVE!;
const CURVE_ABI = [
  "event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost)",
  "event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout)",
];

interface VolumeData {
  totalVolumeOKB: number
  uniqueTraders: number
  totalBuys: number
  totalSells: number
  lastIndexed: string
}

let cache: VolumeData = {
  totalVolumeOKB: 0,
  uniqueTraders: 0,
  totalBuys: 0,
  totalSells: 0,
  lastIndexed: "",
};

export async function indexEvents(): Promise<VolumeData> {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_XLAYER_MAINNET_RPC!);
    const curve = new ethers.Contract(CURVE, CURVE_ABI, provider);
    const block = await provider.getBlockNumber();

    let totalVolume = 0n;
    const traders = new Set<string>();
    let totalBuys = 0;
    let totalSells = 0;

    const CHUNK = 5000;
    const LOOKBACK = 500000;

    for (let toBlock = block; toBlock > block - LOOKBACK; toBlock -= CHUNK) {
      const fromBlock = Math.max(toBlock - CHUNK, block - LOOKBACK);
      try {
        const [buys, sells] = await Promise.all([
          curve.queryFilter(curve.filters.Buy(), fromBlock, toBlock),
          curve.queryFilter(curve.filters.Sell(), fromBlock, toBlock),
        ]);
        for (const e of buys) {
          const ev = e as any;
          totalVolume += ev.args.totalCost;
          traders.add(ev.args.buyer);
          totalBuys++;
        }
        for (const e of sells) {
          const ev = e as any;
          totalVolume += ev.args.totalPayout;
          traders.add(ev.args.seller);
          totalSells++;
        }
      } catch(e) {}
    }

    cache = {
      totalVolumeOKB: parseFloat(ethers.formatEther(totalVolume)),
      uniqueTraders: traders.size,
      totalBuys,
      totalSells,
      lastIndexed: new Date().toISOString(),
    };

    console.log(`[events] Volume: ${cache.totalVolumeOKB} OKB, Traders: ${cache.uniqueTraders}`);
  } catch(e: any) {
    console.error("[events] Index failed:", e.message);
  }
  return cache;
}

export function getCachedEvents(): VolumeData {
  return cache;
}
