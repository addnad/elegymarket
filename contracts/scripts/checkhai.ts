import { network } from "hardhat";
const { ethers } = await network.create();

const WALLET = "0xCDBEB927b6F8576640fd60FC6f23CAbbeEE0C76a";
const HAI_ADDRESS = "0x9518351bFe3fC123026f02097F85DC19ca07F049";

const TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];
const token = new ethers.Contract(HAI_ADDRESS, TOKEN_ABI, ethers.provider);
const balance = await token.balanceOf(WALLET);
console.log(`HAI balance: ${ethers.formatEther(balance)}`);
