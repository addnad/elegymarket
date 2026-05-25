import { network } from "hardhat";
const { ethers } = await network.create();

const DEPLOYER = "0xCDBEB927b6F8576640fd60FC6f23CAbbeEE0C76a";
const CURVE_V1 = "0x40583962C06a20f45074D79a1d8d4681cd31504C";

const TOKEN_ABI = ["function balanceOf(address) view returns (uint256)"];
const CURVE_ABI = ["function tokens(string) view returns (address, string, uint256, uint256, bool)"];

const CODES = ["ENG","BRA","FRA","ARG","MAR","MEX","USA","GER","ESP","POR"];
const curve = new ethers.Contract(CURVE_V1, CURVE_ABI, ethers.provider);

for (const code of CODES) {
  try {
    const [tokenAddr,,supply,,active] = await curve.tokens(code);
    const token = new ethers.Contract(tokenAddr, TOKEN_ABI, ethers.provider);
    const balance = await token.balanceOf(DEPLOYER);
    if (balance > 0n) {
      console.log(`${code}: balance=${ethers.formatEther(balance)} supply=${supply}`);
    }
  } catch(e) {}
}
console.log("Done");
