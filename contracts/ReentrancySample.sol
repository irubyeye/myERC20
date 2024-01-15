// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ReentrancySample is ReentrancyGuard {
    mapping(address => uint256) public _balances;

    function deposite() external payable {
        _balances[msg.sender] = msg.value;
    }

    function withdraw() public {
        require(_balances[msg.sender] > 0, "Your deposite is 0");
        (bool success, ) = msg.sender.call{value: _balances[msg.sender]}("");
        require(success, "Not succesful transaction!");
        _balances[msg.sender] = 0;
    }

    function withdrawHealthy() public nonReentrant {
        uint256 balance = _balances[msg.sender];
        require(balance > 0, "Your deposite is 0");
        _balances[msg.sender] -= balance;
        payable(msg.sender).transfer(balance);
    }

    function etherBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
