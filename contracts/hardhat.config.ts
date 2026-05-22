import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

const PRIVATE_KEY = process.env.ORACLE_SIGNER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    xlayer_testnet: {
      type: "http",
      chainType: "l1",
      url: "https://testrpc.xlayer.tech",
      accounts: [PRIVATE_KEY],
    },
    xlayer_mainnet: {
      type: "http",
      chainType: "l1",
      url: "https://rpc.xlayer.tech",
      accounts: [PRIVATE_KEY],
    },
  },
});
