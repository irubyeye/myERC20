// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract SignatureVesting is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    mapping(bytes => bool) isClaimed;
    mapping(bytes => bool) isUsedSignature;
    mapping(address => uint256) nonces;

    uint256 cliff;
    uint256 chainId;

    IERC20 immutable _token;

    constructor(
        IERC20 vestedToken,
        uint256 _cliffPeriod,
        uint256 _chainId
    ) Ownable(msg.sender) {
        _token = vestedToken;
        cliff = block.timestamp + _cliffPeriod;
        chainId = _chainId;
    }

    function getChainId() external view returns (uint256) {
        return chainId;
    }

    function getCurrUserNonce(
        address _userToCheck
    ) external view returns (uint256) {
        return nonces[_userToCheck];
    }

    function canClaim(
        uint256 _amount,
        uint256 _nonce,
        uint256 _chainId,
        bytes calldata _signature,
        address _contractAddress
    ) internal view returns (bool) {
        bytes32 message = keccak256(
            abi.encodePacked(
                msg.sender,
                _amount,
                _nonce,
                _chainId,
                address(this)
            )
        );

        address recoveredSigner = ECDSA.recover(message, _signature);

        return
            nonces[msg.sender] == _nonce &&
            !isUsedSignature[_signature] &&
            !isClaimed[_signature] &&
            address(this) == _contractAddress &&
            recoveredSigner == owner();
    }

    function recoveringResult(
        uint256 _amount,
        uint256 _nonce,
        uint256 _chainId,
        bytes calldata _signature,
        address _contractAddress,
        bytes32 _messageHash
    ) external view returns (address) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _amount,
                _nonce,
                _chainId,
                address(this)
            )
        );

        require(messageHash == _messageHash, "Messages are different");

        //bytes32 message = messageHash.toEthSignedMessageHash();

        address recoveredSigner = messageHash.toEthSignedMessageHash().recover(
            _signature
        );

        return recoveredSigner;
    }

    function claim(
        uint256 _amount,
        uint256 _nonce,
        uint256 _chainId,
        bytes calldata _signature,
        address _contractAddress
    ) external {
        require(
            block.timestamp >= cliff &&
                canClaim(
                    _amount,
                    _nonce,
                    _chainId,
                    _signature,
                    _contractAddress
                ),
            "You are not allowed to perform this!"
        );

        isClaimed[_signature] = true;
        isUsedSignature[_signature] = true;
        nonces[msg.sender]++;

        _token.transfer(msg.sender, _amount);
    }
}
