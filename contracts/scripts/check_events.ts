import { network } from "hardhat";
const { ethers } = await network.create();

const CURVE = "0x113aC3D59766DC82604d748ff00E9a80cEF00ee6";
const CURVE_ABI = [
  "event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost)",
  "event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout)",
];

const curve = new ethers.Contract(CURVE, CURVE_ABI, ethers.provider);
const block = await ethers.provider.getBlockNumber();

let totalVolume = 0n;
const traders = new Set<string>();
let totalBuys = 0;
let totalSells = 0;

const CHUNK = 5000;
const LOOKBACK = 500000; // ~11 days back

for (let toBlock = block; toBlock > block - LOOKBACK; toBlock -= CHUNK) {
  const fromBlock = Math.max(toBlock - CHUNK, block - LOOKBACK);
  process.stdout.write(`Scanning ${fromBlock}-${toBlock}...   \r`);

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
  } catch(e) {
    // skip failed chunks
  }
}

console.log(`\nBuy events:      ${totalBuys}`);
console.log(`Sell events:     ${totalSells}`);
console.log(`Total volume:    ${ethers.formatEther(totalVolume)} OKB`);
console.log(`Unique traders:  ${traders.size}`);
