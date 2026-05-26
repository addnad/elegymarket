// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./GriefToken.sol";
import "./SentimentOracle.sol";

contract GriefBondingCurve is Ownable, ReentrancyGuard {

    uint256 public constant BASE_PRICE   = 0.008 ether;
    uint256 public constant SLOPE        = 0.000001 ether;
    uint256 public constant SELL_SPREAD  = 95;
    uint256 public constant PLATFORM_FEE = 5;
    uint256 public constant MAX_PER_TX   = 5;
    uint256 public constant MAX_SUPPLY   = 10000;

    SentimentOracle public oracle;
    address public treasury;

    struct TokenInfo {
        GriefToken token;
        string     teamCode;
        uint256    supply;
        uint256    reserve;
        bool       active;
    }

    mapping(string => TokenInfo) public tokens;
    string[] public teamCodes;

    event TokenRegistered(string indexed teamCode, address token);
    event Buy(string indexed teamCode, address indexed buyer, uint256 amount, uint256 totalCost);
    event Sell(string indexed teamCode, address indexed seller, uint256 amount, uint256 totalPayout);

    constructor(address _oracle, address _treasury) Ownable(msg.sender) {
        oracle = SentimentOracle(_oracle);
        treasury = _treasury;
    }

    function registerToken(string calldata teamCode, address tokenAddress) external onlyOwner {
        require(!tokens[teamCode].active, "Already registered");
        tokens[teamCode] = TokenInfo({
            token: GriefToken(tokenAddress),
            teamCode: teamCode,
            supply: 0,
            reserve: 0,
            active: true
        });
        teamCodes.push(teamCode);
        emit TokenRegistered(teamCode, tokenAddress);
    }

    function priceAt(string calldata teamCode, uint256 supplyLevel) public view returns (uint256) {
        uint256 base = BASE_PRICE + SLOPE * supplyLevel;
        uint256 multiplier = oracle.getMultiplier(teamCode);
        return base * multiplier / 100;
    }

    function getBuyPrice(string calldata teamCode) public view returns (uint256) {
        return getBuyPriceFor(teamCode, 1);
    }

    function getBuyPriceFor(string calldata teamCode, uint256 amount) public view returns (uint256) {
        require(amount >= 1 && amount <= MAX_PER_TX, "Amount 1-5");
        TokenInfo storage info = tokens[teamCode];
        require(info.active, "Token not active");
        require(info.supply + amount <= MAX_SUPPLY, "Max supply reached");
        uint256 total = 0;
        for (uint256 i = 0; i < amount; i++) {
            total += priceAt(teamCode, info.supply + i);
        }
        return total;
    }

    function getSellPrice(string calldata teamCode) public view returns (uint256) {
        return getSellPriceFor(teamCode, 1);
    }

    function getSellPriceFor(string calldata teamCode, uint256 amount) public view returns (uint256) {
        require(amount >= 1 && amount <= MAX_PER_TX, "Amount 1-5");
        TokenInfo storage info = tokens[teamCode];
        require(info.active, "Token not active");
        require(info.supply >= amount, "Not enough supply");
        require(info.reserve > 0, "No reserve");
        // Payout is proportional share of reserve, with sell spread applied
        uint256 payout = info.reserve * amount * SELL_SPREAD / (info.supply * 100);
        return payout;
    }

    function buy(string calldata teamCode, uint256 amount) external payable nonReentrant {
        require(amount >= 1 && amount <= MAX_PER_TX, "Amount 1-5");
        TokenInfo storage info = tokens[teamCode];
        require(info.active, "Token not active");
        require(info.supply + amount <= MAX_SUPPLY, "Max supply reached");

        uint256 totalCost = getBuyPriceFor(teamCode, amount);
        require(msg.value >= totalCost, "Insufficient OKB");

        uint256 excess = msg.value - totalCost;
        if (excess > 0) {
            (bool refundOk,) = payable(msg.sender).call{value: excess}("");
            require(refundOk, "Refund failed");
        }

        uint256 fee = totalCost * PLATFORM_FEE / 100;
        uint256 toReserve = totalCost - fee;
        (bool feeOk,) = payable(treasury).call{value: fee}("");
        require(feeOk, "Fee transfer failed");

        info.supply += amount;
        info.reserve += toReserve;
        info.token.mint(msg.sender, amount * 1 ether);

        emit Buy(teamCode, msg.sender, amount, totalCost);
    }

    function sell(string calldata teamCode, uint256 amount) external nonReentrant {
        require(amount >= 1 && amount <= MAX_PER_TX, "Amount 1-5");
        TokenInfo storage info = tokens[teamCode];
        require(info.active, "Token not active");
        require(info.supply >= amount, "Not enough supply");

        uint256 totalPayout = getSellPriceFor(teamCode, amount);
        require(info.reserve >= totalPayout, "Insufficient reserve");

        info.token.burn(msg.sender, amount * 1 ether);
        info.supply -= amount;
        info.reserve -= totalPayout;

        (bool ok,) = payable(msg.sender).call{value: totalPayout}("");
        require(ok, "Payout failed");

        emit Sell(teamCode, msg.sender, amount, totalPayout);
    }

    function getTeamCodes() external view returns (string[] memory) {
        return teamCodes;
    }

    receive() external payable {}
}
