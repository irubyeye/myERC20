// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleRootVesting is Ownable {
    bytes32 storageMerkleRoot;

    mapping(address => bool) isClaimed;

    uint256 cliff;

    IERC20 immutable _token;

    constructor(IERC20 vestedToken, uint256 _cliffPeriod) Ownable(msg.sender) {
        _token = vestedToken;
        cliff = block.timestamp + _cliffPeriod;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return storageMerkleRoot;
    }

    function setVesting(bytes32 _merkleRoot) external onlyOwner {
        storageMerkleRoot = _merkleRoot;
    }

    function canClaim(
        uint256 _amount,
        bytes32[] calldata _merkleProof
    ) private view returns (bool) {
        return
            !isClaimed[msg.sender] &&
            MerkleProof.verify(
                _merkleProof,
                storageMerkleRoot,
                keccak256(abi.encodePacked(msg.sender, _amount))
            );
    }

    function claim(uint256 _amount, bytes32[] calldata _merkleProof) external {
        require(
            block.timestamp >= cliff && canClaim(_amount, _merkleProof),
            "You are not allowed to perform this!"
        );
        isClaimed[msg.sender] = true;
        _token.transfer(msg.sender, _amount);
    }
}
