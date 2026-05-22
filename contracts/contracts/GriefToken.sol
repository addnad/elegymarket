// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title GriefToken
/// @notice One ERC-20 per eliminated team. Minted at elimination, traded on the bonding curve.
contract GriefToken is ERC20, Ownable {
    string public teamName;
    string public teamCode;
    uint256 public eliminatedAt;
    address public bondingCurve;

    event BondingCurveSet(address indexed curve);

    constructor(
        string memory _teamName,
        string memory _teamCode,
        address _owner
    ) ERC20(
        string.concat("GRIEF-", _teamCode),
        string.concat("GRIEF_", _teamCode)
    ) Ownable(_owner) {
        teamName = _teamName;
        teamCode = _teamCode;
        eliminatedAt = block.timestamp;
    }

    function setBondingCurve(address _curve) external onlyOwner {
        require(bondingCurve == address(0), "Curve already set");
        bondingCurve = _curve;
        emit BondingCurveSet(_curve);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == bondingCurve, "Only bonding curve");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == bondingCurve, "Only bonding curve");
        _burn(from, amount);
    }
}
