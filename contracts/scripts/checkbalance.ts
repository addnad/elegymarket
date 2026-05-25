import { network } from "hardhat";
const { ethers } = await network.create();
const balance = await ethers.provider.getBalance("0xCDBEB927b6F8576640fd60FC6f23CAbbeEE0C76a");
console.log("Balance:", ethers.formatEther(balance), "OKB");
