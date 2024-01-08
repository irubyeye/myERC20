import { MyERC20__factory } from "../typechain-types/factories/contracts/MyERC20__factory";
import { MyERC20 } from "../typechain-types/contracts/MyERC20";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("myERC20", function () {
  let myERC20: MyERC20;
  let owner: any;
  let user1: any;
  let user2: any;
  const initialMint: bigint = BigInt(100000000);

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const MyERC20Factory: MyERC20__factory = await ethers.getContractFactory("MyERC20");
    myERC20 = await MyERC20Factory.deploy(3600);
  });

  describe("Deployment", () => {
    it("Should deploy myERC contract", async () => {
      const address: string = await myERC20.getAddress();

      expect(address).to.not.equal(0);
    });

    it("Should mint initial supply to owner", async () => {
      const balanceOwner: bigint = await myERC20.balanceOf(owner.address);

      expect(balanceOwner).to.equal(initialMint);
    });

    it("Should set total amount to initial supply", async () => {
      const totalSupply: bigint = await myERC20.totalSupply();
      const balanceOwner: bigint = await myERC20.balanceOf(owner.address);

      expect(totalSupply).to.equal(balanceOwner);
    });
  });

  describe("Transfer operations", () => {
    it("Should transfer tokens between accounts", async () => {
      const transferAmount: number = 1000;

      await myERC20.connect(owner).transfer(user1.address, transferAmount);

      const balanceUser1: bigint = await myERC20.balanceOf(user1.address);

      expect(balanceUser1).to.equal(transferAmount);
    });

    it("Should decrease amount of tokens at owner's acc by transfer amount", async () => {
      const transferAmount: number = 1000;

      const ownerBalanceBeforeTransfer: bigint = await myERC20.balanceOf(owner.address);

      await myERC20.connect(owner).transfer(user1.address, transferAmount);

      const ownerBalanceAfterTransfer: bigint = await myERC20.balanceOf(owner.address);

      expect(ownerBalanceAfterTransfer).to.equal(
        ownerBalanceBeforeTransfer - BigInt(transferAmount),
      );
    });

    it("Should not allow transfers exceeding the balance", async () => {
      const initialBalanceUser1: bigint = await myERC20.balanceOf(user1.address);

      const transferAmount: bigint = initialBalanceUser1 + BigInt(1);

      await expect(
        myERC20.connect(user1).transfer(user2.address, transferAmount),
      ).to.be.revertedWith("Not enough tokens to transfer!");
    });

    it("Should not allow transfers to address(0)", async () => {
      const transferAmount: number = 100;

      await expect(
        myERC20.connect(owner).transfer(ethers.ZeroAddress, transferAmount),
      ).to.be.revertedWith("Recipient can not be 0!");
    });

    it("Should return initial price of the token to be 0", async () => {
      const tokenPrice: bigint = await myERC20._getTokenPrice();

      await expect(tokenPrice).to.equal(0);
    });

    it("Should set allowance correctly", async () => {
      const amountToApprove: number = 1000;

      await myERC20.connect(owner).approve(user1.address, amountToApprove);

      const allowance: bigint = await myERC20.allowance(owner.address, user1.address);
      expect(allowance).to.equal(amountToApprove);
    });

    it("Should not allow transfer more than approved amount", async () => {
      const amountToApprove: number = 100;
      const amountToTransfer: number = 150;

      await myERC20.connect(owner).approve(user1.address, amountToApprove);

      await expect(
        myERC20.connect(user1).transferFrom(owner.address, user1.address, amountToTransfer),
      ).to.be.reverted;
    });

    it("Should not allow spender to transfer when no allowance is set", async () => {
      const amountToTransfer: number = 100;
      await expect(
        myERC20.connect(user1).transferFrom(owner.address, user1.address, amountToTransfer),
      ).to.be.reverted;
    });

    it("Should allow transferFrom if allowed", async () => {
      const amount: bigint = BigInt(100);

      await myERC20.connect(owner).approve(user1.address, amount);
      await myERC20.connect(user1).transferFrom(owner.address, user2.address, amount);

      const ownerBalance: bigint = await myERC20.balanceOf(owner.address);
      const user2Balance: bigint = await myERC20.balanceOf(user2.address);

      expect(ownerBalance).to.equal(initialMint - amount);
      expect(user2Balance).to.equal(amount);
    });
  });

  describe("Token operations", () => {
    it("Should allow user to buy tokens", async () => {
      const votePrice: bigint = BigInt(150);
      const ethersSent: bigint = BigInt(1);
      const expectedAmount: bigint = ethers.parseEther(ethersSent.toString()) / votePrice;

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(user1).buy({
        value: ethers.parseEther(ethersSent.toString()),
      });

      const user1Balance: bigint = await myERC20.balanceOf(user1);

      expect(user1Balance).to.equal(expectedAmount);
    });

    it("Should deny user to buy tokens if eth amount is 0", async () => {
      const votePrice: bigint = BigInt(150);
      const ethersSent: bigint = BigInt(0);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await expect(
        myERC20.connect(user1).buy({
          value: ethers.parseEther(ethersSent.toString()),
        }),
      ).to.be.revertedWith("Value must be greater than 0!");
    });

    it("Should allow user to sell tokens", async () => {
      const votePrice: bigint = BigInt(1500000000);
      const sellAmount: bigint = BigInt(15000000);
      const ethersSent: bigint = BigInt(1);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(user1).buy({
        value: ethers.parseEther(ethersSent.toString()),
      });

      const initialEthBalance = await ethers.provider.getBalance(owner.address);

      await myERC20.connect(owner).sell(sellAmount);

      const finalEthBalance = await ethers.provider.getBalance(owner.address);

      expect(finalEthBalance).to.be.above(initialEthBalance);
    });

    it("Should not allow user to sell tokens if selling amount gt user balance", async () => {
      const votePrice: bigint = BigInt(1500000000);
      const sellAmount: bigint = BigInt(150000000);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await expect(myERC20.connect(owner).sell(sellAmount)).to.be.revertedWith(
        "Not enough tokens to sell!",
      );
    });
  });

  describe("Voting", () => {
    it("Should allow a user with a proper amount of tokens to start voting", async () => {
      const votePrice: bigint = BigInt(150);

      await myERC20.connect(owner).vote(votePrice);
    });

    it("Should deny user with amount of 0.05% to 0.1% from total supply of tokens to start vote", async () => {
      const testVotePrice: bigint = BigInt(100);
      const lessThanThreshold: bigint = (initialMint * BigInt(6)) / BigInt(10000);

      await myERC20.connect(owner).transfer(user1.address, lessThanThreshold);

      await expect(myERC20.connect(user1).vote(testVotePrice)).to.be.revertedWith(
        "You can not start voting!",
      );
    });

    it("Should deny user with amount less than 0.05% from total supply of tokens to vote", async () => {
      const testVotePrice: bigint = BigInt(100);
      const lessThanVoteQuote: bigint = (initialMint * BigInt(4)) / BigInt(10000);

      await myERC20.connect(owner).transfer(user1.address, lessThanVoteQuote);
      await myERC20.connect(owner).vote(testVotePrice);

      await expect(myERC20.connect(user1).vote(testVotePrice)).to.be.revertedWith(
        "You can not vote!",
      );
    });

    it("Should protect from the double voting by the same user", async () => {
      const testVotePrice: bigint = BigInt(100);
      const anotherVotePrice: bigint = BigInt(60);

      await myERC20.connect(owner).vote(testVotePrice);

      await expect(myERC20.connect(owner).vote(anotherVotePrice)).to.be.revertedWith(
        "Already voted!",
      );
    });

    it("Should correctly set the token price due to voting results", async () => {
      const votePrices: number[] = [150, 200];

      const user1Transfer: number = 30000000;
      const user2Transfer: number = 10000000;

      await myERC20.connect(owner).transfer(user1.address, user1Transfer);
      await myERC20.connect(owner).transfer(user2.address, user2Transfer);

      await myERC20.connect(user1).vote(votePrices[0]);
      await myERC20.connect(user2).vote(votePrices[0]);
      await myERC20.connect(owner).vote(votePrices[1]);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      const tokenPrice = await myERC20._getTokenPrice();
      const expectedTokenPrice = votePrices[1];

      expect(tokenPrice).to.equal(expectedTokenPrice);
    });

    it("Should deny end voting before it period expired", async () => {
      const votePrice: bigint = BigInt(100);
      const user1Transfer: bigint = BigInt(40000000);

      await myERC20.connect(owner).transfer(user1.address, user1Transfer);

      await myERC20.connect(user1).vote(votePrice);

      await expect(myERC20.endVote()).to.be.revertedWith("Voting is in progress!");
    });

    it("Should deny to vote after voting period expired, but voting hasn't ended in the system yet", async () => {
      const votePrice: bigint = BigInt(100);
      const user1Transfer: bigint = BigInt(40000000);

      await myERC20.connect(owner).transfer(user1.address, user1Transfer);

      await myERC20.vote(votePrice);

      await network.provider.send("evm_increaseTime", [3601]);
      await network.provider.send("evm_mine", []);

      await expect(myERC20.connect(user1).vote(votePrice)).to.be.revertedWith(
        "Voting period has ended! Summing up results...",
      );
    });

    it("Should deny to transfer tokens if person voted and voting hasn't ended yet.", async () => {
      const votePrice: bigint = BigInt(100);
      const user1Transfer: bigint = BigInt(40000000);

      await myERC20.vote(votePrice);

      await expect(
        myERC20.connect(owner).transfer(user1.address, user1Transfer),
      ).to.be.revertedWith("You are not allowed perform this during the voting!");
    });

    it("Should deny to buy tokens if person voted and voting hasn't ended yet.", async () => {
      const votePrice: bigint = BigInt(100);

      await myERC20.vote(votePrice);

      await expect(myERC20.connect(owner).buy()).to.be.revertedWith(
        "You are not allowed perform this during the voting!",
      );
    });

    it("Should deny to sell tokens if person voted and voting hasn't ended yet.", async () => {
      const votePrice: bigint = BigInt(100);
      const tokensToSell: bigint = BigInt(40000000);

      await myERC20.vote(votePrice);

      await expect(myERC20.connect(owner).sell(tokensToSell)).to.be.revertedWith(
        "You are not allowed perform this during the voting!",
      );
    });
  });

  describe("Fee operations", () => {
    it("Should collect fees from buying operations", async function () {
      const votePrice: bigint = BigInt(100);
      const ethersSent: bigint = BigInt(1);
      const tokToBuy: bigint = ethers.parseEther(ethersSent.toString()) / BigInt(100);
      const expectedReceivedToks: bigint = tokToBuy - (tokToBuy * BigInt(10)) / BigInt(100);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(owner).setBuySellFeePercentage(10);

      await myERC20.connect(user1).buy({
        value: ethers.parseEther(ethersSent.toString()),
      });

      expect(await myERC20.balanceOf(user1)).to.equal(expectedReceivedToks);
    });

    it("Should collect fees from selling operations", async function () {
      const votePrice: bigint = BigInt(10000000);
      const ethersSent: bigint = BigInt(10);
      const tokToSell: bigint = BigInt(1000000);
      const sellFee: bigint = (tokToSell * votePrice * BigInt(10)) / BigInt(100);
      const expectedReceivedEth: bigint = tokToSell * votePrice - sellFee;

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(user1).buy({
        value: ethers.parseEther(ethersSent.toString()),
      });

      await myERC20.connect(owner).setBuySellFeePercentage(10);

      const initialBalance: bigint = await ethers.provider.getBalance(owner.address);

      const transaction = await myERC20.connect(owner).sell(tokToSell);

      const receipt = await transaction.wait();

      const gasUsed: bigint | undefined = receipt?.gasUsed;
      const gasPrice: bigint | undefined = receipt?.gasPrice;
      const totalCost: bigint = gasPrice && gasUsed ? gasPrice * gasUsed : BigInt(0);
      const finalBalance: bigint = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.equal(initialBalance - totalCost + expectedReceivedEth);
    });

    it("Should collect fees on contract's address before burning", async () => {
      const votePrice: bigint = BigInt(10000000);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(owner).setBuySellFeePercentage(10);

      await myERC20.connect(owner).buy({
        value: ethers.parseEther("1"),
      });

      await myERC20.connect(owner).buy({
        value: ethers.parseEther("1"),
      });

      const feesAmount = await myERC20.balanceOf(await myERC20.getAddress());

      expect(feesAmount).to.be.gt(BigInt(0));
    });

    it("Should burn collected fees", async function () {
      const votePrice: bigint = BigInt(10000000);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(owner).setBuySellFeePercentage(10);

      await myERC20.connect(owner).buy({
        value: ethers.parseEther("1"),
      });

      await network.provider.send("evm_increaseTime", [604800]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).buy({
        value: ethers.parseEther("1"),
      });

      const finalTokenBalance: bigint = await myERC20.balanceOf(await myERC20.getAddress());

      expect(finalTokenBalance).to.equal(BigInt(0));
    });
  });

  describe("Events", () => {
    it("Should emit Buy event", async function () {
      const votePrice: bigint = BigInt(100);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      const value = ethers.parseEther("1");
      const expectedAmount: bigint = value / votePrice;

      await expect(await myERC20.connect(user1).buy({ value }))
        .to.emit(myERC20, "Buy")
        .withArgs(user1.address, expectedAmount, value);
    });

    it("Should emit Sell event", async function () {
      const votePrice: bigint = BigInt(100);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      await myERC20.connect(owner).endVote();

      await myERC20.connect(user1).buy({
        value: ethers.parseEther("1"),
      });

      const sellAmount: bigint = BigInt(1000);

      await expect(myERC20.connect(owner).sell(sellAmount))
        .to.emit(myERC20, "Sell")
        .withArgs(owner.address, sellAmount, sellAmount * votePrice);
    });

    it("Should emit Voting started event", async function () {
      const votePrice: bigint = BigInt(100);
      const votingStarted = await myERC20.connect(owner).vote(votePrice);

      const latestBlock = await ethers.provider.getBlock("latest");
      const blockTime: number = latestBlock?.timestamp || 0;

      await expect(votingStarted)
        .to.emit(myERC20, "VotingStarted")
        .withArgs(blockTime, blockTime + 3600, 0);
    });

    it("Should emit Voted event", async () => {
      const votePrice: bigint = BigInt(100);

      await expect(myERC20.connect(owner).vote(votePrice))
        .to.emit(myERC20, "Voted")
        .withArgs(owner.address, votePrice, votePrice);
    });

    it("Should emit EndVote event", async function () {
      const votePrice: bigint = BigInt(100);

      await myERC20.connect(owner).vote(votePrice);

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine", []);

      const voteEnded = await myERC20.connect(owner).endVote();

      const latestBlock = await ethers.provider.getBlock("latest");
      const blockTime: number = latestBlock?.timestamp || 0;

      await expect(voteEnded).to.emit(myERC20, "VotingEnded").withArgs(blockTime, votePrice);
    });
  });
});
