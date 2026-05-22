import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.create({ network: "xlayer_testnet" });

const TEAMS = [
  { name: "Brazil",    code: "BRA", flag: "🇧🇷" },
  { name: "France",    code: "FRA", flag: "🇫🇷" },
  { name: "Morocco",   code: "MAR", flag: "🇲🇦" },
  { name: "Argentina", code: "ARG", flag: "🇦🇷" },
]

const CURVE_ADDRESS  = "0x8561108607d18e4Fc8EA807376Bef8b0aA137828"
const ORACLE_ADDRESS = "0xf67684506c5F614977cc8D3602E3Bb6360ee9897"

const curveAbi = [
  "function registerToken(string, address) external",
  "function getBuyPrice(string) view returns (uint256)",
  "function buy(string) external payable",
]

const tokenAbi = [
  "function setBondingCurve(address) external",
]

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deployer:", deployer.address)

  const curve = new ethers.Contract(CURVE_ADDRESS, curveAbi, deployer)
  const Token = await ethers.getContractFactory("GriefToken")
  const addresses: Record<string, string> = {}

  for (const team of TEAMS) {
    console.log(`\nDeploying ${team.name} (${team.code})...`)

    // Deploy token
    const token = await Token.deploy(team.name, team.code, deployer.address)
    await token.waitForDeployment()
    const tokenAddress = await token.getAddress()
    console.log(`  Token deployed: ${tokenAddress}`)

    // Wire to curve
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, deployer)
    await tokenContract.setBondingCurve(CURVE_ADDRESS)
    await curve.registerToken(team.code, tokenAddress)
    console.log(`  Wired to bonding curve`)

    // Seed buy
    const price = await curve.getBuyPrice(team.code)
    const buyValue = price + (price * 2n / 100n)
    await curve.buy(team.code, { value: buyValue })
    console.log(`  Seed buy done at ${ethers.formatEther(price)} OKB`)

    addresses[team.code] = tokenAddress
  }

  // Save results
  const existing = JSON.parse(fs.readFileSync("deployed.json", "utf8"))
  existing.tokens = { ...existing.tokens, ...addresses }
  fs.writeFileSync("deployed.json", JSON.stringify(existing, null, 2))

  console.log("\n--- Add these to .env.local ---")
  for (const [code, addr] of Object.entries(addresses)) {
    console.log(`NEXT_PUBLIC_GRIEF_TOKEN_${code}=${addr}`)
  }
}

main().catch(console.error)
