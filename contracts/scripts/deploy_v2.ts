import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.create();

// Reuse existing oracle
const ORACLE_ADDRESS = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443";

const TEAMS = [
  { name: "England", code: "ENG" }, { name: "France", code: "FRA" },
  { name: "Germany", code: "GER" }, { name: "Spain", code: "ESP" },
  { name: "Portugal", code: "POR" }, { name: "Netherlands", code: "NED" },
  { name: "Belgium", code: "BEL" }, { name: "Croatia", code: "CRO" },
  { name: "Switzerland", code: "SUI" }, { name: "Austria", code: "AUT" },
  { name: "Norway", code: "NOR" }, { name: "Scotland", code: "SCO" },
  { name: "Sweden", code: "SWE" }, { name: "Turkey", code: "TUR" },
  { name: "Bosnia and Herzegovina", code: "BIH" }, { name: "Czechia", code: "CZE" },
  { name: "Algeria", code: "ALG" }, { name: "Cape Verde", code: "CPV" },
  { name: "Egypt", code: "EGY" }, { name: "Ghana", code: "GHA" },
  { name: "Ivory Coast", code: "CIV" }, { name: "Morocco", code: "MAR" },
  { name: "Senegal", code: "SEN" }, { name: "South Africa", code: "RSA" },
  { name: "Tunisia", code: "TUN" }, { name: "DR Congo", code: "COD" },
  { name: "Australia", code: "AUS" }, { name: "Iran", code: "IRN" },
  { name: "Japan", code: "JPN" }, { name: "Jordan", code: "JOR" },
  { name: "Qatar", code: "QAT" }, { name: "Saudi Arabia", code: "KSA" },
  { name: "South Korea", code: "KOR" }, { name: "Uzbekistan", code: "UZB" },
  { name: "Iraq", code: "IRQ" }, { name: "Argentina", code: "ARG" },
  { name: "Brazil", code: "BRA" }, { name: "Colombia", code: "COL" },
  { name: "Ecuador", code: "ECU" }, { name: "Paraguay", code: "PAR" },
  { name: "Uruguay", code: "URU" }, { name: "United States", code: "USA" },
  { name: "Canada", code: "CAN" }, { name: "Mexico", code: "MEX" },
  { name: "Curacao", code: "CUW" }, { name: "Haiti", code: "HAI" },
  { name: "Panama", code: "PAN" }, { name: "New Zealand", code: "NZL" },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "OKB\n");

  // Deploy new GriefBondingCurve
  console.log("Deploying GriefBondingCurve v2...");
  const Curve = await ethers.getContractFactory("GriefBondingCurve");
  const curve = await Curve.deploy(ORACLE_ADDRESS, deployer.address);
  await curve.waitForDeployment();
  const curveAddress = await curve.getAddress();
  console.log("GriefBondingCurve:", curveAddress);

  // Deploy all 48 tokens
  const Token = await ethers.getContractFactory("GriefToken");
  const tokenAddresses: Record<string, string> = {};

  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    try {
      process.stdout.write(`[${i + 1}/${TEAMS.length}] Deploying ${team.code}... `);
      const token = await Token.deploy(team.name, team.code, deployer.address);
      await token.waitForDeployment();
      const addr = await token.getAddress();
      tokenAddresses[team.code] = addr;
      await token.setBondingCurve(curveAddress);
      await curve.registerToken(team.code, addr);
      console.log(`✓ ${addr}`);
    } catch (e: any) {
      console.log(`✗ FAILED: ${e.message}`);
    }
  }

  fs.writeFileSync("deployed_v2.json", JSON.stringify({
    sentimentOracle: ORACLE_ADDRESS,
    bondingCurve: curveAddress,
    tokens: tokenAddresses,
  }, null, 2));

  console.log("\n\nAddresses saved to deployed_v2.json");
  console.log("\n--- Update these in Vercel + .env.local ---");
  console.log("NEXT_PUBLIC_SENTIMENT_ORACLE=" + ORACLE_ADDRESS);
  console.log("NEXT_PUBLIC_BONDING_CURVE=" + curveAddress);
  for (const [code, addr] of Object.entries(tokenAddresses)) {
    console.log(`NEXT_PUBLIC_GRIEF_TOKEN_${code}=${addr}`);
  }
}

main().catch(console.error);
