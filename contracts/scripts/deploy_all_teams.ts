import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.create();

const CURVE_ADDRESS = "0x40583962C06a20f45074D79a1d8d4681cd31504C";
const ORACLE_ADDRESS = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443";

const TEAMS = [
  // Already deployed
  // { name: "England", code: "ENG" }, // 0x86a0c6f3E1FeC5fefb954Ef319e35144a82B07b6

  // UEFA
  { name: "France",                  code: "FRA" },
  { name: "Germany",                 code: "GER" },
  { name: "Spain",                   code: "ESP" },
  { name: "Portugal",                code: "POR" },
  { name: "Netherlands",             code: "NED" },
  { name: "Belgium",                 code: "BEL" },
  { name: "Croatia",                 code: "CRO" },
  { name: "Switzerland",             code: "SUI" },
  { name: "Austria",                 code: "AUT" },
  { name: "Norway",                  code: "NOR" },
  { name: "Scotland",                code: "SCO" },
  { name: "Sweden",                  code: "SWE" },
  { name: "Turkey",                  code: "TUR" },
  { name: "Bosnia and Herzegovina",  code: "BIH" },
  { name: "Czechia",                 code: "CZE" },

  // CAF (Africa)
  { name: "Algeria",                 code: "ALG" },
  { name: "Cape Verde",              code: "CPV" },
  { name: "Egypt",                   code: "EGY" },
  { name: "Ghana",                   code: "GHA" },
  { name: "Ivory Coast",             code: "CIV" },
  { name: "Morocco",                 code: "MAR" },
  { name: "Senegal",                 code: "SEN" },
  { name: "South Africa",            code: "RSA" },
  { name: "Tunisia",                 code: "TUN" },
  { name: "DR Congo",                code: "COD" },

  // AFC (Asia)
  { name: "Australia",               code: "AUS" },
  { name: "Iran",                    code: "IRN" },
  { name: "Japan",                   code: "JPN" },
  { name: "Jordan",                  code: "JOR" },
  { name: "Qatar",                   code: "QAT" },
  { name: "Saudi Arabia",            code: "KSA" },
  { name: "South Korea",             code: "KOR" },
  { name: "Uzbekistan",              code: "UZB" },
  { name: "Iraq",                    code: "IRQ" },

  // CONMEBOL (South America)
  { name: "Argentina",               code: "ARG" },
  { name: "Brazil",                  code: "BRA" },
  { name: "Colombia",                code: "COL" },
  { name: "Ecuador",                 code: "ECU" },
  { name: "Paraguay",                code: "PAR" },
  { name: "Uruguay",                 code: "URU" },

  // CONCACAF
  { name: "United States",           code: "USA" },
  { name: "Canada",                  code: "CAN" },
  { name: "Mexico",                  code: "MEX" },
  { name: "Curacao",                 code: "CUW" },
  { name: "Haiti",                   code: "HAI" },
  { name: "Panama",                  code: "PAN" },

  // OFC (Oceania)
  { name: "New Zealand",             code: "NZL" },
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "OKB\n");
  console.log(`Deploying ${TEAMS.length} tokens...\n`);

  const Token = await ethers.getContractFactory("GriefToken");
  const curve = await ethers.getContractAt("GriefBondingCurve", CURVE_ADDRESS);
  const tokenAddresses: Record<string, string> = {
    ENG: "0x86a0c6f3E1FeC5fefb954Ef319e35144a82B07b6"
  };

  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    try {
      process.stdout.write(`[${i + 1}/${TEAMS.length}] Deploying ${team.code}... `);
      const token = await Token.deploy(team.name, team.code, deployer.address);
      await token.waitForDeployment();
      const addr = await token.getAddress();
      tokenAddresses[team.code] = addr;

      await token.setBondingCurve(CURVE_ADDRESS);
      await curve.registerToken(team.code, addr);
      console.log(`✓ ${addr}`);
    } catch (e: any) {
      console.log(`✗ FAILED: ${e.message}`);
    }
  }

  fs.writeFileSync("deployed.json", JSON.stringify({
    sentimentOracle: ORACLE_ADDRESS,
    bondingCurve: CURVE_ADDRESS,
    tokens: tokenAddresses,
  }, null, 2));

  console.log("\n\nAddresses saved to deployed.json");
  console.log("\n--- Vercel env vars ---");
  console.log("NEXT_PUBLIC_SENTIMENT_ORACLE=" + ORACLE_ADDRESS);
  console.log("NEXT_PUBLIC_BONDING_CURVE=" + CURVE_ADDRESS);
  for (const [code, addr] of Object.entries(tokenAddresses)) {
    console.log(`NEXT_PUBLIC_GRIEF_TOKEN_${code}=${addr}`);
  }
}

main().catch(console.error);
