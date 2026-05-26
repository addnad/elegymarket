import { network } from "hardhat";

process.on('unhandledRejection', () => {});

const { ethers } = await network.create();

const NEW_CURVE = "0x113aC3D59766DC82604d748ff00E9a80cEF00ee6";
const COMPROMISED = "0x9677f0333b9f367eaafc17119955c72e19c6520824c07d634cc610515f598078";

const TOKENS: Record<string, string> = {
  ENG: "0xc27b50921f51c71bDEd255961e3D28eB4975259A",
  FRA: "0xE37d99DCb5b52f40855E558d43Cd57AbF886aFaF",
  GER: "0x64a1b104F7ADCC011282bA7622a1C87F27227D23",
  ESP: "0x8fdd36809C1f24EBe07834726E525aF80A84460C",
  POR: "0x2D7723207D2eA893e198f57c80957fFb824B9c96",
  NED: "0x05A2cEbA506F472Eb19341a71C040a15872FA146",
  BEL: "0x9C863CcBF212ce90fC23d38C914430F94e3492E9",
  CRO: "0x1ffba705EF4c465E6393B0074F0f0a13052A6Fb5",
  SUI: "0xc507357950ebD558f264e65b04Bd50b876cb46A4",
  AUT: "0x34DE6Bd1B7bd63Af9803b63c729f15Ba82DBE843",
  NOR: "0xA27Ef295211359F50f466a182B7898aB3CD086fA",
  SCO: "0x2687052ec61b63546B2acF37Ca70ec55151FbCc4",
  SWE: "0x4276C4050c8094Fef4FF366B9770C3e149193bf5",
  TUR: "0x7e7b6c2e65602e847a355F96cbf2eFd97883043C",
  BIH: "0xD8d38DfE6EBABa1Ab20F0e5Fa991B66dbb9F2228",
  CZE: "0x7C2a22a51Ee510dd4A61BD1Ba73e8431f17da629",
  ALG: "0x52d36BC358d48FedA4DA8B17Db147bAef3aC9651",
  CPV: "0x34C8d65319910BfF1a0a9B76278ca582cda41BB4",
  EGY: "0xC998be27d97619bf98C433cb0d45CfDBeb9d3511",
  GHA: "0x9316bdA30D0895A3909c088FDA43B9684061b5Fe",
  CIV: "0xd84Fa9F21974cdF2f25Ee7b0e7e38387a2809f32",
  MAR: "0x5692Fb120D333f76A63Ed47dBE61707037a86757",
  SEN: "0x23022699056B82F65Ad83B220bA916eC71f2bCc7",
  RSA: "0xc98d23b8302B2cCB3D1369346890416dC7D2fAa5",
  TUN: "0x477d0b1cbF020AE7d06533C5dB866c2C4F6d391A",
  COD: "0x31eEEf3Bb7FACEB46DeE0fD167e28daf54993936",
  AUS: "0x04c4b6a77a4470c174c61233432ef78b30Bf5446",
  IRN: "0x529fB2fD8d6eDca78a5a45fDb40B161969a1ddc3",
  JPN: "0xcD9da1F8f98008bD361dc9Dd5b2566d83DD01f09",
  JOR: "0x2F13a84D5a73017980C89F17c02813DD915e33c9",
  QAT: "0xA6d3E2e32F3f47951bB39E0d93E684E91d550043",
  KSA: "0x2BfDA6d4483ff926c210AD8742cDe08C582561f2",
  KOR: "0x7206FE2050D13C5e682B8f4c6a33353b50B14a7d",
  UZB: "0xc9831ec9a7256f9CeF79ABe9021680fB7C1cB994",
  IRQ: "0xEc0B8C966dF148c584BF5Fbaa644f4AB70f2cbD6",
  ARG: "0x2cC65b22f5f67f3448b3982A2E1d853d87317248",
  BRA: "0x4c0bCd54bd0C23736c700f14E68bD303b871c55C",
  COL: "0xAA1D39a58C43de2D3b4f52dD1b39EbC793Bb2c5b",
  ECU: "0x1D6b6202Df4C66A6C8e37549384A50599A965942",
  PAR: "0x89EA23Fe870931784fbCAcbC20dF288c050CaD3b",
  URU: "0xb6Fb1D1f6C00Eb40C35C2Ffb72485dE480377ea2",
  USA: "0x0366212e23c84bdDE93dD6796e062dB20a12FF3a",
  CAN: "0x9D77F3645861681aA04757ECDeff2bd27649B6E8",
  MEX: "0x2E6FB8fdcA926DdDc85D27f33ec4F86a086fE7F6",
  CUW: "0x0ec6C856e4b0797bfb34a252364829cD3d8de2F6",
  HAI: "0x9518351bFe3fC123026f02097F85DC19ca07F049",
  PAN: "0xbA83d61482a1b1d15a8821D5f0Bb5C364F97562F",
  NZL: "0xbc3E59fAE5FE01522A4cf10C2c77478Db33A2E96",
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const provider = new ethers.JsonRpcProvider("https://xlayer.drpc.org");
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);
  const compromised = new ethers.Wallet(COMPROMISED, provider);

  const curveAbi = ["function registerToken(string calldata teamCode, address tokenAddress) external"];
  const tokenAbi = ["function transferOwnership(address newOwner) external", "function owner() view returns (address)"];
  const curve = new ethers.Contract(NEW_CURVE, curveAbi, deployer);

  console.log("Registering 48 tokens to new curve...");

  for (const [code, address] of Object.entries(TOKENS)) {
    try {
      const token = new ethers.Contract(address, tokenAbi, provider);
      const currentOwner = await token.owner();

      // Transfer ownership if still owned by compromised wallet
      if (currentOwner.toLowerCase() === compromised.address.toLowerCase()) {
        const tokenWithSigner = new ethers.Contract(address, tokenAbi, compromised);
        const tx1 = await tokenWithSigner.transferOwnership(NEW_CURVE);
        console.log(`  [${code}] ownership tx: ${tx1.hash}`);
        await sleep(3000);
      } else {
        console.log(`  [${code}] ownership already transferred`);
      }

      // Register on new curve
      const tx2 = await curve.registerToken(code, address);
      console.log(`  [${code}] register tx: ${tx2.hash}`);
      await sleep(3000);

      console.log(`✓ ${code} done`);
    } catch (e: any) {
      console.error(`✗ ${code} failed:`, e.shortMessage || e.message);
    }
  }

  console.log("All done!");
}

main().catch(console.error);
