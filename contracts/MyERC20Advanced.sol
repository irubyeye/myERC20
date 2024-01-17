// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./VotingLinkedList.sol";

/**
 * @title MyERC20
 * @dev A simple ERC-20 token with additional features like voting and fee collection.
 */
contract MyERC20Advanced is IERC20, Ownable {
    VotingLinkedList public votingLinkedList;
    /**
     * @dev Mapping to save user balanses.
     */
    mapping(address => uint256) private _balances;

    /**
     * @dev Allowances for token transfers
     */
    mapping(address => mapping(address => uint256)) private _allowances;

    /**
     * @dev Flag to indicate whether a voting round is in progress
     */
    mapping(uint256 => bool) private _isVotingInProgress;

    /**
     * @dev Mapping to store whether an address has voted in a specific voting round
     */
    mapping(address => uint256) private _isVoted;

    /**
     * @dev Price power for each price in a specific voting round
     */
    mapping(uint256 => mapping(uint256 => uint256)) private _pricePower;

    mapping(uint256 => mapping(uint256 => bytes32)) private _wasPriceInVoting;

    mapping(uint256 => mapping(address => uint256[2]))
        private _votingUserParams;

    /**
     * @dev Current token price variable
     */
    uint256 private _tokenPrice;

    /**
     * @dev Total supply of the tokens in system
     */
    uint256 private _totalSupply;

    /**
     * @dev Current Fee percentage
     * @notice Fee applies only on selling and buying operations
     */
    uint256 private _buySellFeePercentage;

    /**
     * @dev Timestamp of the last fee collection time
     */
    uint256 private _lastFeeCollectionTime;

    /**
     * @dev Period of time in seconds for the voting
     */
    uint256 private _timeToVote;

    /**
     * @dev Current leader voting price
     */
    uint256 private _votePrice;

    /**
     * @dev Id of the last or current voting
     */
    uint256 private _votingId;

    /**
     * @dev Timestamp of the moment when the voting will be ended
     */
    uint256 private _votingEndTime;

    /**
     * @dev Emits when user votes
     */
    event Voted(
        address indexed voter,
        uint256 indexed price,
        uint256 indexed votePrice
    );

    /**
     * @dev Emits when user starts voting
     */
    event VotingStarted(
        uint256 startTime,
        uint256 endTime,
        uint256 indexed votePrice
    );

    /**
     * @dev Emits when user ends voting
     */
    event VotingEnded(uint256 endTime, uint256 indexed votePrice);

    /**
     * @dev Emits when user buys tokens
     */
    event Buy(address indexed buyer, uint256 amount, uint256 cost);

    /**
     * @dev Emits when user sell tokens
     */
    event Sell(address indexed seller, uint256 amount, uint256 earnings);

    /**
     * @dev Emits when fee is collected
     */
    event FeeCollected(uint256 feeAmount);

    /**
     * @dev Emits when collected fees are burnt
     */
    event FeeBurned(uint256 feeBurned);

    /**
     * @dev Constructor to initialize the contract.
     * @param _votingTime The duration of each voting round.
     */
    constructor(
        uint256 _votingTime,
        VotingLinkedList _linkedList
    ) Ownable(msg.sender) IERC20() {
        _timeToVote = _votingTime;
        _mint(owner(), 100000000);
        votingLinkedList = _linkedList;
    }

    /**
     * @dev Modifier to check if the caller is eligible to vote.
     */
    modifier canVote() {
        require(
            _balances[msg.sender] >= getMinTokenAmountToVote(),
            "You can not vote!"
        );
        _;
    }

    /**
     * @dev Modifier to check if the contract is not in a voting round.
     */
    modifier isNotInVoting() {
        require(
            !(_isVotingInProgress[_votingId] &&
                _isVoted[msg.sender] == _votingId),
            "You are not allowed perform this during the voting!"
        );
        _;
    }

    /**
     * @dev Function to calculate the minimum token amount required to vote.
     * @return The minimum token amount required to vote.
     */
    function getMinTokenAmountToVote() internal view returns (uint256) {
        uint256 minTokenAmountToVote = _totalSupply / 2000;
        return minTokenAmountToVote;
    }

    /**
     * @dev Function to get the start voting threshold.
     * @return The start voting threshold.
     */
    function getStartVotingThreshold() internal view returns (uint256) {
        uint256 startVotingThreshold = _totalSupply / 1000;
        return startVotingThreshold;
    }

    /**
     * @dev Function to get the current or last voting id.
     * @return The voting id.
     */
    function getVotingId() external view returns (uint256) {
        return _votingId;
    }

    /**
     * @dev Function to get the eth amount on this contract.
     * @return Amount of ethers on contract balance.
     */
    function etherBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Function to get the current token price.
     * @return The current token price.
     */
    function _getTokenPrice() external view returns (uint256) {
        return _tokenPrice;
    }

    /**
     * @dev Function to get the current leader voting price.
     * @return The current token price.
     */
    function _getVotingPrice() external view returns (uint256) {
        return _votePrice;
    }

    /**
     * @dev Function to get the price power.
     * @return The power of certain price in the current voting.
     */
    function _getPowerOfVotingPrice(
        uint256 _price
    ) external view returns (uint256) {
        return _pricePower[_votingId][_price];
    }

    /**
     * @dev Function to get the total token supply.
     * @return The total token supply.
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Function to get the balance of a specific address.
     * @param _account The address to check the balance for.
     * @return The balance of the specified address.
     */
    function balanceOf(address _account) external view returns (uint256) {
        return _balances[_account];
    }

    /**
     * @dev Function to transfer tokens from the caller to a recipient.
     * @param _recipient The address to receive the tokens.
     * @param _amount The amount of tokens to transfer.
     * @return A boolean indicating the success of the transfer.
     */
    function transfer(
        address _recipient,
        uint256 _amount
    ) external isNotInVoting returns (bool) {
        require(
            _balances[msg.sender] >= _amount,
            "Not enough tokens to transfer!"
        );
        require(_recipient != address(0), "Recipient can not be 0!");

        _balances[msg.sender] -= _amount;
        _balances[_recipient] += _amount;

        emit Transfer(msg.sender, _recipient, _amount);
        return true;
    }

    /**
     * @dev Function to get the allowance for a spender on behalf of the owner.
     * @param _owner The owner's address.
     * @param _spender The spender's address.
     * @return The allowance for the specified spender.
     */
    function allowance(
        address _owner,
        address _spender
    ) external view returns (uint256) {
        return _allowances[_owner][_spender];
    }

    /**
     * @dev Function to approve a spender to spend a certain amount of tokens on behalf of the owner.
     * @param _spender The address to approve.
     * @param _amount The amount to approve.
     * @return A boolean indicating the success of the approval.
     */
    function approve(
        address _spender,
        uint256 _amount
    ) external returns (bool) {
        _allowances[msg.sender][_spender] = _amount;

        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     * @dev Function to transfer tokens from one address to another.
     * @param _sender The address to transfer tokens from.
     * @param _recipient The address to transfer tokens to.
     * @param _amount The amount of tokens to transfer.
     * @return A boolean indicating the success of the transfer.
     */
    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    ) external returns (bool) {
        require(
            !(_isVotingInProgress[_votingId] && _isVoted[_sender] == _votingId),
            "You can not perform this because owner is in voting!"
        );
        require(_balances[_sender] >= _amount, "Not enough tokens!");
        require(_allowances[_sender][msg.sender] >= _amount);

        _balances[_sender] -= _amount;
        _balances[_recipient] += _amount;

        _allowances[_sender][msg.sender] -= _amount;

        emit Transfer(_sender, _recipient, _amount);
        return true;
    }

    /**
     * @dev Function to burn collected fees.
     */
    function burnFees() internal {
        if (block.timestamp - _lastFeeCollectionTime >= 1 weeks) {
            uint256 totalFees = _balances[address(this)];

            _burn(address(this), totalFees);

            _lastFeeCollectionTime = block.timestamp;

            emit FeeBurned(totalFees);
        }
    }

    /**
     * @dev Function to set the buy and sell fee percentage. Only callable by the owner.
     * @param _percentage The new buy and sell fee percentage.
     */
    function setBuySellFeePercentage(uint256 _percentage) external onlyOwner {
        require(
            _percentage <= 100 && _percentage >= 0,
            "Percentage must be less than or equal to 100"
        );
        _buySellFeePercentage = _percentage;
    }

    /**
     * @dev Function to mint new tokens and handle buying transactions.
     */
    function _mint(address _account, uint256 _amount) internal {
        require(_account != address(0), "Recipient can not be 0!");
        _totalSupply += _amount;
        _balances[_account] += _amount;
        emit Transfer(address(0), _account, _amount);
    }

    /**
     * @dev Test function to assume that tokens cannot be minted at 0x address.
     */
    function testMintToZero() external {
        _mint(address(0), 0);
    }

    /**
     * @dev Function to burn tokens from an account.
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0));
        require(amount <= _balances[account]);

        _totalSupply -= amount;
        _balances[account] -= amount;
        emit Transfer(account, address(0), amount);
    }

    /**
     * @dev Test function to assume that tokens cannot be burnt from 0x address.
     */
    function testZeroBurn() external {
        _burn(address(0), 0);
    }

    /**
     * @dev Test function to assume that amount tokens to burn is always lt balance
     */
    function burnGtBalance(address _address) external {
        _burn(_address, 1);
        _mint(_address, 1);
    }

    /**
     * @dev Function to handle buying tokens.
     */
    function buy() external payable isNotInVoting {
        require(msg.value > 0, "Value must be greater than 0!");

        uint256 tokensToMint = msg.value / _tokenPrice;
        uint256 feeAmount = (tokensToMint * _buySellFeePercentage) / 100;

        _mint(address(this), feeAmount);
        emit FeeCollected(feeAmount);

        uint256 finalTokensToMint = tokensToMint - feeAmount;

        _mint(msg.sender, finalTokensToMint);

        burnFees();

        emit Buy(msg.sender, finalTokensToMint, msg.value);
    }

    /**
     * @dev Function to handle selling tokens.
     */
    function sell(uint256 _amount) external isNotInVoting {
        require(_balances[msg.sender] >= _amount, "Not enough tokens to sell!");

        uint256 feeAmount = (_amount * _buySellFeePercentage) / 100;
        uint256 finalTokensToBurn = _amount - feeAmount;

        _mint(address(this), feeAmount);
        emit FeeCollected(feeAmount);

        burnFees();

        _burn(msg.sender, finalTokensToBurn);

        uint256 earnings = finalTokensToBurn * _tokenPrice;
        payable(msg.sender).transfer(earnings);

        emit Sell(msg.sender, finalTokensToBurn, earnings);
    }

    /**
     * @dev Function for an address to vote on a specific price during a voting round.
     * @param _price The price to vote for.
     */
    function vote(
        uint256 _price,
        bytes32 _indexToInsert
    ) external canVote returns (bool) {
        if (!_isVotingInProgress[_votingId]) {
            require(
                _balances[msg.sender] >= getStartVotingThreshold(),
                "You can not start voting!"
            );
            _votingId++;
            _isVotingInProgress[_votingId] = true;
            _votingEndTime = block.timestamp + _timeToVote;

            emit VotingStarted(
                block.timestamp,
                block.timestamp + _timeToVote,
                _votePrice
            );

            bytes32 priceId = votingLinkedList.addEntry(
                _price,
                _balances[msg.sender]
            );

            uint256 userBalance = _balances[msg.sender];
            _votingUserParams[_votingId][msg.sender][0] = _price;
            _votingUserParams[_votingId][msg.sender][1] = userBalance;

            _isVoted[msg.sender] = _votingId;

            _wasPriceInVoting[_votingId][_price] = priceId;

            return true;
        }

        require(
            block.timestamp < _votingEndTime,
            "Voting period has ended! Summing up results..."
        );

        require(_isVoted[msg.sender] != _votingId, "Already voted!");

        voteAndStorePricePower(_price, msg.sender, _indexToInsert);

        emit Voted(msg.sender, _price, _votePrice);

        return true;
    }

    function voteAndStorePricePower(
        uint256 _price,
        address _userAddr,
        bytes32 _indexToInsert
    ) internal {
        bytes32 priceId = _wasPriceInVoting[_votingId][_price];

        if (priceId == 0) {
            uint256 userBalance = _balances[_userAddr];

            _votingUserParams[_votingId][msg.sender][0] = _price;
            _votingUserParams[_votingId][msg.sender][1] = userBalance;

            priceId = votingLinkedList.insertAtIndex(
                _indexToInsert,
                _price,
                _balances[_userAddr]
            );

            _wasPriceInVoting[_votingId][_price] = priceId;
            _pricePower[_votingId][_price] = _balances[_userAddr];
        } else {
            uint256 userBalance = _balances[_userAddr];
            uint256 currPricePower = _pricePower[_votingId][_price];

            currPricePower += userBalance;

            votingLinkedList.updatePower(priceId, currPricePower);
            votingLinkedList.moveEntry(priceId, _indexToInsert);

            _pricePower[_votingId][_price] += userBalance;

            _votingUserParams[_votingId][msg.sender][0] = _price;
            _votingUserParams[_votingId][msg.sender][1] = userBalance;
        }
    }

    function changePricePower(address _userAddress) private {
        if (
            _isVotingInProgress[_votingId] &&
            _isVoted[_userAddress] == _votingId
        ) {
            uint256[2] memory voteData = _votingUserParams[_votingId][
                _userAddress
            ];
            uint256 votedPrice = voteData[0];
            uint256 votedPower = voteData[1];
            uint256 currUserBalance = _balances[_userAddress];

            if (currUserBalance > votedPower) {
                _pricePower[_votingId][votedPrice] += (currUserBalance -
                    votedPower);

                _votingUserParams[_votingId][_userAddress][1] = currUserBalance;
            } else {
                _pricePower[_votingId][votedPrice] -= (votedPower -
                    currUserBalance);

                _votingUserParams[_votingId][_userAddress][1] = currUserBalance;
            }

            // if (
            //     _pricePower[_votingId][votedPrice] >
            //     _pricePower[_votingId][_votePrice]
            // ) {
            //     _votePrice = votedPrice;
            // } else {
            //     uint256 newLeaderPrice;
            //     for(uint256 i = 0; i < _votedPrices[])
            // }
        }
    }

    // function getPricesPowersArray() external view returns (uint256[][] memory) {
    //     uint256[] memory votedPrices = _votedPrices[_votingId];
    //     uint256[][] memory pricesPowersArray = new uint256[][](
    //         votedPrices.length
    //     );

    //     for (uint256 i = 0; i < votedPrices.length; i++) {
    //         uint256[] memory pricePowerArray = new uint256[](2);

    //         pricePowerArray[0] = votedPrices[i];
    //         pricePowerArray[1] = _pricePower[_votingId][votedPrices[i]];

    //         pricesPowersArray[i] = pricePowerArray;
    //     }

    //     return pricesPowersArray;
    // }

    /**
     * @dev Function to end a voting round and set the token price to the winning voted price.
     */
    function endVote() external {
        require(block.timestamp > _votingEndTime, "Voting is in progress!");

        _isVotingInProgress[_votingId] = false;
        _tokenPrice = _votePrice;

        emit VotingEnded(block.timestamp, _votePrice);

        _votePrice = 0;
    }
}
