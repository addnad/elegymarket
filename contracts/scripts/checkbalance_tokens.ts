import { network } from "hardhat";
const { ethers } = await network.create();

const DEPLOYER = "0xCDBEB927b6F8576640fd60FC6f23CAbbeEE0C76a";
const CURVE = "0xd03dfa9133c19b12ad81320bdc0d3810295b6a21";

const TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];
const CURVE_ABI = ["function tokens(string) view returns (address, string, uint256, uint256, bool)"];

const CODES = ["ENG","BRA","FRA","ARG","MAR","MEX","USA","GER","ESP","POR"];

const curve = new ethers.Contract(CURVE, CURVE_ABI, ethers.provider);

for (const code of CODES) {
  const [tokenAddr,,supply,,active] = await curve.tokens(code);
  const token = new ethers.Contract(tokenAddr, TOKEN_ABI, ethers.provider);
  const balance = await token.balanceOf(DEPLOYER);
  if (balance > 0n) {
    console.log(`${code}: balance=${ethers.formatEther(balance)} supply=${supply} active=${active}`);
  }
}
console.log("Done checking");
