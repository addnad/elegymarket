import { network } from "hardhat";
const { ethers } = await network.create();

const CURVE_V1 = "0x40583962C06a20f45074D79a1d8d4681cd31504C";
const CURVE_ABI = [
  "function sell(string calldata teamCode, uint256 amount) external",
  "function getSellPriceFor(string calldata teamCode, uint256 amount) view returns (uint256)",
  "function tokens(string) view returns (address, string, uint256, uint256, bool)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Selling from:", deployer.address);

  const curve = new ethers.Contract(CURVE_V1, CURVE_ABI, deployer);

  // Check current supply and sell price
  const [,, supply,,] = await curve.tokens("ENG");
  console.log("V1 ENG supply:", supply.toString());

  const sellPrice = await curve.getSellPriceFor("ENG", 5n);
  console.log("Sell price for 5 tokens:", ethers.formatEther(sellPrice), "OKB");

  // Sell in batches of 5
  const batches = Math.floor(Number(supply) / 5);
  const remainder = Number(supply) % 5;

  for (let i = 0; i < batches; i++) {
    console.log(`Selling batch ${i + 1}/${batches} (5 tokens)...`);
    const tx = await curve.sell("ENG", 5n);
    await tx.wait();
    console.log(`✓ tx: ${tx.hash}`);
  }

  if (remainder > 0) {
    console.log(`Selling remainder: ${remainder} tokens...`);
    const tx = await curve.sell("ENG", BigInt(remainder));
    await tx.wait();
    console.log(`✓ tx: ${tx.hash}`);
  }

  console.log("Done — all V1 ENG tokens sold");
}

main().catch(console.error);
