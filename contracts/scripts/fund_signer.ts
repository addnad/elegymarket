import { network } from "hardhat";
const { ethers } = await network.create();

async function main() {
  // Use deployer key explicitly
  const provider = ethers.provider;
  const deployer = new ethers.Wallet("0xREDACTED_PRIVATE_KEY", provider);
  const NEW_SIGNER = "0x2dC4e477b02eC3F4b122588b31a4803A399D1aD0";
  
  console.log("Funding from:", deployer.address);
  const tx = await deployer.sendTransaction({
    to: NEW_SIGNER,
    value: ethers.parseEther("0.005"),
  });
  await tx.wait();
  console.log("✓ Sent 0.005 OKB to", NEW_SIGNER);
  console.log("  tx:", tx.hash);
}

main().catch(console.error);
