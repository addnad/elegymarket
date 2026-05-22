import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.create({ network: "xlayer_testnet" });

const TEAMS = [
  { name: "England",   code: "ENG" },
  { name: "Brazil",    code: "BRA" },
  { name: "France",    code: "FRA" },
  { name: "Morocco",   code: "MAR" },
  { name: "Argentina", code: "ARG" },
]

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deployer:", deployer.address)
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "OKB\n")

  // 1. Deploy Oracle
  console.log("Deploying SentimentOracle...")
  const Oracle = await ethers.getContractFactory("SentimentOracle")
  const oracle = await Oracle.deploy(deployer.address)
  await oracle.waitForDeployment()
  const oracleAddress = await oracle.getAddress()
  console.log("SentimentOracle:", oracleAddress)

  // 2. Deploy BondingCurve
  console.log("Deploying GriefBondingCurve...")
  const Curve = await ethers.getContractFactory("GriefBondingCurve")
  const curve = await Curve.deploy(oracleAddress, deployer.address)
  await curve.waitForDeployment()
  const curveAddress = await curve.getAddress()
  console.log("GriefBondingCurve:", curveAddress)

  // 3. Deploy + wire all tokens
  const tokenAddresses: Record<string, string> = {}
  const Token = await ethers.getContractFactory("GriefToken")

  for (const team of TEAMS) {
    console.log(`\nDeploying ${team.name} (${team.code})...`)

    const token = await Token.deploy(team.name, team.code, deployer.address)
    await token.waitForDeployment()
    const tokenAddress = await token.getAddress()
    console.log(`  Token: ${tokenAddress}`)

    // Wait for each wiring tx to confirm before next step
    const tx1 = await token.setBondingCurve(curveAddress)
    await tx1.wait()
    console.log("  bondingCurve set")

    const tx2 = await curve.registerToken(team.code, tokenAddress)
    await tx2.wait()
    console.log("  registered in curve")

    // Now safe to read price
    const price = await curve.getBuyPriceFor(team.code, 2)
    const buyValue = price + (price * 2n / 100n)
    const tx3 = await curve.buy(team.code, 2, { value: buyValue })
    await tx3.wait()
    console.log(`  seeded with 2 buys at ${ethers.formatEther(price)} OKB total`)

    tokenAddresses[team.code] = tokenAddress
  }

  // Save
  const deployed = {
    sentimentOracle: oracleAddress,
    bondingCurve: curveAddress,
    tokens: tokenAddresses,
    deployer: deployer.address,
    network: "xlayer_testnet",
  }
  fs.writeFileSync("deployed.json", JSON.stringify(deployed, null, 2))

  console.log("\n--- Update .env.local with these ---")
  console.log("NEXT_PUBLIC_SENTIMENT_ORACLE=" + oracleAddress)
  console.log("NEXT_PUBLIC_BONDING_CURVE=" + curveAddress)
  for (const [code, addr] of Object.entries(tokenAddresses)) {
    console.log(`NEXT_PUBLIC_GRIEF_TOKEN_${code}=${addr}`)
  }
}

main().catch(console.error)
