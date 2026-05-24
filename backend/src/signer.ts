import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

const ORACLE_ABI = [
  "function updateScore(string calldata teamCode, uint8 score, uint256 timestamp, bytes calldata signature) external",
  "function getScore(string calldata teamCode) external view returns (uint8 value, uint256 updatedAt)",
];

let currentNonce: number | null = null;

function getProvider() {
  const rpc = process.env.NEXT_PUBLIC_XLAYER_MAINNET_RPC!;
  return new ethers.JsonRpcProvider(rpc);
}

function getWallet() {
  const privateKey = process.env.ORACLE_SIGNER_PRIVATE_KEY!;
  return new ethers.Wallet(privateKey, getProvider());
}

async function getNextNonce(wallet: ethers.Wallet): Promise<number> {
  if (currentNonce === null) {
    currentNonce = await wallet.getNonce();
  } else {
    currentNonce++;
  }
  return currentNonce;
}

function resetNonce() {
  currentNonce = null;
}

export async function signAndSubmitScore(
  teamCode: string,
  score: number
): Promise<{ txHash: string; score: number; teamCode: string }> {
  const wallet = getWallet();
  const oracleAddress = process.env.NEXT_PUBLIC_SENTIMENT_ORACLE!;
  const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, wallet);

  const timestamp = Math.floor(Date.now() / 1000);
  const hash = ethers.solidityPackedKeccak256(
    ["string", "uint8", "uint256"],
    [teamCode, score, timestamp]
  );
  const signature = await wallet.signMessage(ethers.getBytes(hash));
  const nonce = await getNextNonce(wallet);

  try {
    const tx = await oracle.updateScore(teamCode, score, timestamp, signature, {
      nonce,
      gasLimit: 200000,
    });
    console.log(`[signer] ${teamCode} score=${score} tx=${tx.hash}`);
    return { txHash: tx.hash, score, teamCode };
  } catch (e: any) {
    resetNonce();
    throw e;
  }
}
