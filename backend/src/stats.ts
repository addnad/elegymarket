import { ethers } from "ethers";

const BONDING_CURVE = "0x113aC3D59766DC82604d748ff00E9a80cEF00ee6";
const DEPLOY_BLOCK = 60747713;
const CHUNK = 5000;

const abi = [
  "event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost)",
  "event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout)"
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export let statsCache = { totalVolume: 0, totalTraders: 0, updatedAt: 0 };

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
}

export async function scanStats() {
  console.log("[stats] Starting full scan via drpc...");
  try {
    const provider = new ethers.JsonRpcProvider("https://xlayer.drpc.org");
    const contract = new ethers.Contract(BONDING_CURVE, abi, provider);
    const latest = await withTimeout(provider.getBlockNumber(), 10000);

    let totalVolume = 0n;
    const traders = new Set<string>();

    for (let start = DEPLOY_BLOCK; start < latest; start += CHUNK) {
      const end = Math.min(start + CHUNK - 1, latest);
      let retries = 3;
      while (retries > 0) {
        try {
          const [buys, sells] = await Promise.all([
            withTimeout(contract.queryFilter(contract.filters.Buy(), start, end), 15000),
            withTimeout(contract.queryFilter(contract.filters.Sell(), start, end), 15000),
          ]);
          for (const e of buys as any[]) {
            totalVolume += e.args.totalCost;
            traders.add(e.args.buyer);
          }
          for (const e of sells as any[]) {
            totalVolume += e.args.totalPayout;
            traders.add(e.args.seller);
          }
          break;
        } catch (e: any) {
          retries--;
          console.log(`[stats] Chunk ${start}-${end} failed (${retries} retries left): ${e.message}`);
          await sleep(2000);
        }
      }
    }

    statsCache = {
      totalVolume: parseFloat(ethers.formatEther(totalVolume)),
      totalTraders: traders.size,
      updatedAt: Date.now(),
    };
    console.log(`[stats] Done — volume: ${statsCache.totalVolume} OKB, traders: ${statsCache.totalTraders}`);
  } catch (e: any) {
    console.error("[stats] Scan failed:", e.message);
  }
}
