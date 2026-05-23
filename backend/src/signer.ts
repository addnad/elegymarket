import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

const ORACLE_ABI = [
  "function updateScore(string calldata teamCode, uint8 score, uint256 timestamp, bytes calldata signature) external",
  "function getScore(string calldata teamCode) external view returns (uint8 value, uint256 updatedAt)",
  "function getMultiplier(string calldata teamCode) external view returns (uint256)",
];

function getWallet(): ethers.Wallet {
  const privateKey = process.env.ORACLE_SIGNER_PRIVATE_KEY!;
  const rpc = process.env.NEXT_PUBLIC_XLAYER_MAINNET_RPC!;
  const provider = new ethers.JsonRpcProvider(rpc);
  return new ethers.Wallet(privateKey, provider);
}

export async function signAndSubmitScore(
  teamCode: string,
  score: number
): Promise<{ txHash: string; score: number; teamCode: string }> {
  const wallet = getWallet();
  const oracleAddress = process.env.NEXT_PUBLIC_SENTIMENT_ORACLE!;
  const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, wallet);

  const timestamp = Math.floor(Date.now() / 1000);

  // Sign the payload
  const hash = ethers.solidityPackedKeccak256(
    ["string", "uint8", "uint256"],
    [teamCode, score, timestamp]
  );
  const signature = await wallet.signMessage(ethers.getBytes(hash));

  // Submit to oracle
  const tx = await oracle.updateScore(teamCode, score, timestamp, signature);
  await tx.wait();

  console.log(`[signer] ${teamCode} score=${score} tx=${tx.hash}`);
  return { txHash: tx.hash, score, teamCode };
}
