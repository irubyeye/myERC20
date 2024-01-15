// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SignatureVesting is Ownable {
    using ECDSA for bytes32;

    mapping(bytes => bool) isClaimed;

    uint256 cliff;

    IERC20 immutable _token;

    constructor(IERC20 vestedToken, uint256 _cliffPeriod) Ownable(msg.sender) {
        _token = vestedToken;
        cliff = block.timestamp + _cliffPeriod;
    }

    function canClaim(
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 message = keccak256(
            abi.encodePacked(msg.sender, _amount, _nonce, address(this))
        );
        return !isClaimed[_signature] && message.recover(_signature) == owner();
    }

    function claim(
        uint256 _amount,
        uint256 _nonce,
        bytes calldata _signature
    ) external {
        require(
            block.timestamp >= cliff && canClaim(_amount, _nonce, _signature),
            "You are not allowed to perform this!"
        );
        isClaimed[_signature] = true;
        _token.transfer(msg.sender, _amount);
    }
}
