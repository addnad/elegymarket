import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.create();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy SentimentOracle
  console.log("Deploying SentimentOracle...");
  const Oracle = await ethers.getContractFactory("SentimentOracle");
  const oracle = await Oracle.deploy(deployer.address);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("SentimentOracle:", oracleAddress);

  // 2. Deploy GriefBondingCurve (treasury = deployer for now)
  console.log("Deploying GriefBondingCurve...");
  const Curve = await ethers.getContractFactory("GriefBondingCurve");
  const curve = await Curve.deploy(oracleAddress, deployer.address);
  await curve.waitForDeployment();
  const curveAddress = await curve.getAddress();
  console.log("GriefBondingCurve:", curveAddress);

  // 3. Deploy test GriefToken for England
  console.log("Deploying GriefToken (ENG)...");
  const Token = await ethers.getContractFactory("GriefToken");
  const token = await Token.deploy("England", "ENG", deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GriefToken (ENG):", tokenAddress);

  // 4. Wire token to curve
  console.log("\nWiring contracts...");
  await token.setBondingCurve(curveAddress);
  await curve.registerToken("ENG", tokenAddress);
  console.log("ENG token wired to bonding curve");

  // 5. Save addresses to a file
  const addresses = {
    sentimentOracle: oracleAddress,
    bondingCurve: curveAddress,
    tokens: { ENG: tokenAddress },
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
  };

  fs.writeFileSync("deployed.json", JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to deployed.json");
  console.log("\n--- Add these to .env.local ---");
  console.log("NEXT_PUBLIC_SENTIMENT_ORACLE=" + oracleAddress);
  console.log("NEXT_PUBLIC_BONDING_CURVE=" + curveAddress);
}

main().catch(console.error);
