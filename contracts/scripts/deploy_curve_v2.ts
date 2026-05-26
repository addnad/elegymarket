import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_XLAYER_MAINNET_RPC);
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  
  console.log("Deploying from:", deployer.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(deployer.address)), "OKB");

  const ORACLE = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443";
  const TREASURY = deployer.address;

  const factory = await ethers.getContractFactory("GriefBondingCurve", deployer);
  const curve = await factory.deploy(ORACLE, TREASURY);
  await curve.waitForDeployment();

  console.log("✓ GriefBondingCurve V2 deployed:", await curve.getAddress());
}

main().catch(console.error);
