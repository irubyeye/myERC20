// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ManualVesting is Ownable {
    mapping(address => uint256) canClaimAmount;

    uint256 cliff;

    IERC20 immutable _token;

    constructor(IERC20 vestedToken, uint256 _cliffPeriod) Ownable(msg.sender) {
        _token = vestedToken;
        cliff = block.timestamp + _cliffPeriod;
    }

    function populateVesting(
        address[] calldata _userAddresses,
        uint256[] calldata _amountsArray
    ) external onlyOwner {
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            canClaimAmount[_userAddresses[i]] = _amountsArray[i];
        }
    }

    function canClaim(uint256 _amount) private view returns (bool) {
        return
            canClaimAmount[msg.sender] >= _amount && block.timestamp >= cliff;
    }

    function claim(uint256 _amount) external {
        require(canClaim(_amount), "Can not claim!");
        canClaimAmount[msg.sender] -= _amount;
        _token.transfer(msg.sender, _amount);
    }

    function getClaimAmount() external view returns (uint256) {
        return canClaimAmount[msg.sender];
    }
}
