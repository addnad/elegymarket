import { network } from "hardhat";
const { ethers } = await network.create();

const wallet = ethers.Wallet.createRandom();
console.log("New Oracle Signer Wallet:");
console.log("Address:     ", wallet.address);
console.log("Private Key: ", wallet.privateKey);
console.log("\nSave the private key — you will NOT see it again.");
