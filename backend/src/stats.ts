import { ethers } from "ethers";
import { getOKBPrice } from "./price";

const BONDING_CURVE = "0x113aC3D59766DC82604d748ff00E9a80cEF00ee6";
const DEPLOY_BLOCK = 60747713;

const abi = [
  "event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost)",
  "event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout)"
];

const RPCS = [
  { url: "https://xlayer.drpc.org", chunk: 5000 },
  { url: "https://rpc.xlayer.tech", chunk: 100 },
];

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export let statsCache = { totalVolumeOKB: 0.307, totalVolumeUSD: 0, totalTraders: 3, updatedAt: Date.now() };

export async function scanStats() {
  console.log("[stats] Starting scan...");

  for (const { url, chunk } of RPCS) {
    try {
      console.log(`[stats] Trying ${url} with chunk=${chunk}...`);
      const provider = new ethers.JsonRpcProvider(url);
      const contract = new ethers.Contract(BONDING_CURVE, abi, provider);
      const latest = await withTimeout(provider.getBlockNumber(), 10000);

      let totalVolume = 0n;
      const traders = new Set<string>();
      let failed = 0;

      for (let start = DEPLOY_BLOCK; start < latest; start += chunk) {
        const end = Math.min(start + chunk - 1, latest);
        try {
          const [buys, sells] = await Promise.all([
            withTimeout(contract.queryFilter(contract.filters.Buy(), start, end), 15000),
            withTimeout(contract.queryFilter(contract.filters.Sell(), start, end), 15000),
          ]);
          for (const e of buys as any[]) { totalVolume += e.args.totalCost; traders.add(e.args.buyer); }
          for (const e of sells as any[]) { totalVolume += e.args.totalPayout; traders.add(e.args.seller); }
          if (chunk <= 100) await sleep(400);
        } catch (e: any) {
          failed++;
          if (failed > 5) throw new Error(`Too many failures on ${url}`);
          await sleep(1000);
        }
      }

      const totalVolumeOKB = parseFloat(ethers.formatEther(totalVolume));
      const okbPrice = await getOKBPrice();
      statsCache = { totalVolumeOKB, totalVolumeUSD: totalVolumeOKB * okbPrice, totalTraders: traders.size, updatedAt: Date.now() };
      console.log(`[stats] Done — ${totalVolumeOKB} OKB ($${statsCache.totalVolumeUSD.toFixed(2)}), traders: ${traders.size}`);
      return;
    } catch (e: any) {
      console.log(`[stats] ${url} failed: ${e.message}, trying next...`);
    }
  }

  console.error("[stats] All RPCs failed, keeping cached values");
}
