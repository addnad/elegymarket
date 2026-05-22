import { network } from "hardhat";

const { ethers } = await network.create({ network: "xlayer_testnet" });

const CURVE = "0x8561108607d18e4Fc8EA807376Bef8b0aA137828";
const TOKEN = "0x207FDf3fc935B015d2098CAc9629a41c1a8108d0";
const ORACLE = "0xf67684506c5F614977cc8D3602E3Bb6360ee9897";

const curveAbi = [
  "function getBuyPrice(string) view returns (uint256)",
  "function tokens(string) view returns (address, string, uint256, uint256, bool)",
];
const tokenAbi = [
  "function bondingCurve() view returns (address)",
  "function teamName() view returns (string)",
];
const oracleAbi = [
  "function getMultiplier(string) view returns (uint256)",
  "function getScore(string) view returns (uint8, uint256)",
];

async function main() {
  const curve = new ethers.Contract(CURVE, curveAbi, ethers.provider);
  const token = new ethers.Contract(TOKEN, tokenAbi, ethers.provider);
  const oracle = new ethers.Contract(ORACLE, oracleAbi, ethers.provider);

  console.log("--- Token state ---");
  const bondingCurve = await token.bondingCurve();
  console.log("bondingCurve set to:", bondingCurve);
  console.log("expected curve:    ", CURVE);
  console.log("match:", bondingCurve.toLowerCase() === CURVE.toLowerCase());

  console.log("\n--- Curve state ---");
  const info = await curve.tokens("ENG");
  console.log("token address:", info[0]);
  console.log("supply:       ", info[2].toString());
  console.log("reserve:      ", info[3].toString());
  console.log("active:       ", info[4]);

  console.log("\n--- Oracle state ---");
  const [score] = await oracle.getScore("ENG");
  const multiplier = await oracle.getMultiplier("ENG");
  console.log("grief score: ", score);
  console.log("multiplier:  ", multiplier.toString());

  console.log("\n--- Buy price ---");
  const price = await curve.getBuyPrice("ENG");
  console.log("buy price (wei):", price.toString());
  console.log("buy price (OKB):", ethers.formatEther(price));
}

main().catch(console.error);
