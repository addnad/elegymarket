// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title SentimentOracle
/// @notice Receives ECDSA-signed grief scores from the AI agent backend.
///         Score ranges 0-100. Multiplier ranges 1x-3x.
contract SentimentOracle is Ownable {
    using ECDSA for bytes32;

    address public signer;

    struct Score {
        uint8 value;
        uint256 updatedAt;
    }

    mapping(string => Score) public scores;

    event ScoreUpdated(string indexed teamCode, uint8 score, uint256 timestamp);
    event SignerUpdated(address indexed newSigner);

    constructor(address _signer) Ownable(msg.sender) {
        signer = _signer;
    }

    function updateScore(
        string calldata teamCode,
        uint8 score,
        uint256 timestamp,
        bytes calldata signature
    ) external {
        require(score <= 100, "Score out of range");
        require(timestamp > block.timestamp - 2 hours, "Signature expired");

        bytes32 hash = keccak256(abi.encodePacked(teamCode, score, timestamp));
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(hash);
        address recovered = ECDSA.recover(ethHash, signature);
        require(recovered == signer, "Invalid signature");

        scores[teamCode] = Score(score, block.timestamp);
        emit ScoreUpdated(teamCode, score, block.timestamp);
    }

    function getMultiplier(string calldata teamCode) external view returns (uint256) {
        uint8 score = scores[teamCode].value;
        return 100 + (uint256(score) * 200 / 100);
    }

    function getScore(string calldata teamCode) external view returns (uint8 value, uint256 updatedAt) {
        Score memory s = scores[teamCode];
        return (s.value, s.updatedAt);
    }

    function updateSigner(address _newSigner) external onlyOwner {
        signer = _newSigner;
        emit SignerUpdated(_newSigner);
    }
}
