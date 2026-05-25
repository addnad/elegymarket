import { network } from "hardhat";
const { ethers } = await network.create();

const ORACLE_ADDRESS = "0x234200FF134ddA9B36a1F13E83dEA006aE8A2443";
const NEW_SIGNER = "0x2dC4e477b02eC3F4b122588b31a4803A399D1aD0";

const ORACLE_ABI = ["function updateSigner(address _newSigner) external"];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Calling updateSigner from:", deployer.address);
  
  const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, deployer);
  const tx = await oracle.updateSigner(NEW_SIGNER);
  await tx.wait();
  
  console.log("✓ Oracle signer updated to:", NEW_SIGNER);
  console.log("  tx:", tx.hash);
}

main().catch(console.error);
