// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract DosVulnerable {
    mapping(address => uint256) public balances;
    mapping(uint256 => mapping(address => uint256)) public transactions;

    address[] public temporaryBlacklistUsers;

    uint256 public tokenPrice;

    modifier ifBlocked() {
        require(!isBlocked(msg.sender), "You are blocked!");
        _;
    }

    constructor(uint256 _tokenPrice) {
        tokenPrice = _tokenPrice;
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function buy() external payable ifBlocked {
        require(msg.value > 0, "Value must be greater than 0!");
        uint256 amountToBuy = msg.value / tokenPrice;
        balances[msg.sender] = amountToBuy;
    }

    function sell(uint256 _amount) external ifBlocked {
        require(balances[msg.sender] > _amount, "Insuffitient balance!");
        balances[msg.sender] -= _amount;
        uint256 amountInEth = _amount * tokenPrice;
        payable(msg.sender).transfer(amountInEth);
    }

    function transferTo(
        address _recipient,
        uint256 _amount
    ) external returns (bool) {
        require(
            balances[msg.sender] >= _amount,
            "Not enough tokens to transfer!"
        );
        require(_recipient != address(0), "Recipient can not be 0!");

        balances[msg.sender] -= _amount;
        balances[_recipient] += _amount;

        transactions[block.number][msg.sender] += 1;

        if (
            transactions[block.number - 2][msg.sender] +
                transactions[block.number - 1][msg.sender] +
                transactions[block.number][msg.sender] >=
            3
        ) {
            temporaryBlacklistUsers.push(msg.sender);
        }

        return true;
    }

    function isBlocked(address _userAddress) internal view returns (bool) {
        for (uint256 i = 0; i < temporaryBlacklistUsers.length; i++) {
            if (temporaryBlacklistUsers[i] == _userAddress) return true;
        }
        return false;
    }
}
