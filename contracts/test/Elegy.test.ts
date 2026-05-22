import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Elegy Contracts", function () {
  let owner: any, buyer: any, treasury: any;
  let griefToken: any, oracle: any, curve: any;

  beforeEach(async function () {
    [owner, buyer, treasury] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("SentimentOracle");
    oracle = await Oracle.deploy(owner.address);

    const Curve = await ethers.getContractFactory("GriefBondingCurve");
    curve = await Curve.deploy(await oracle.getAddress(), treasury.address);

    const Token = await ethers.getContractFactory("GriefToken");
    griefToken = await Token.deploy("England", "ENG", owner.address);

    await griefToken.setBondingCurve(await curve.getAddress());
    await curve.registerToken("ENG", await griefToken.getAddress());
  });

  it("deploys with correct team info", async function () {
    expect(await griefToken.teamName()).to.equal("England");
    expect(await griefToken.teamCode()).to.equal("ENG");
  });

  it("oracle returns default multiplier of 100 when no score set", async function () {
    expect(await oracle.getMultiplier("ENG")).to.equal(100n);
  });

  it("bonding curve registers token as active", async function () {
    const info = await curve.tokens("ENG");
    expect(info.active).to.equal(true);
  });

  it("buy price equals base price with default multiplier", async function () {
    const price = await curve.getBuyPrice("ENG");
    expect(price).to.equal(ethers.parseEther("0.0001"));
  });

  it("buy mints 1 token to buyer", async function () {
    const price = await curve.getBuyPrice("ENG");
    await curve.connect(buyer).buy("ENG", { value: price });
    const balance = await griefToken.balanceOf(buyer.address);
    expect(balance).to.equal(ethers.parseEther("1"));
  });

  it("sell returns ETH to seller after buying", async function () {
    const price = await curve.getBuyPrice("ENG");
    await curve.connect(buyer).buy("ENG", { value: price });
    await griefToken.connect(buyer).approve(await curve.getAddress(), ethers.parseEther("1"));
    const balanceBefore = await ethers.provider.getBalance(buyer.address);
    await curve.connect(buyer).sell("ENG");
    const balanceAfter = await ethers.provider.getBalance(buyer.address);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
