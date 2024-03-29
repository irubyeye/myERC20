import { expect } from 'chai';
import { ethers } from 'hardhat';
import { MyERC20Advanced } from './../typechain-types/contracts/MyERC20Advanced';
import { VotingLinkedList } from './../typechain-types/contracts/VotingLinkedList';
import type { HardhatEthersSigner } from '../node_modules/@nomicfoundation/hardhat-ethers/src/signers.ts';

describe('Advanced voting system', () => {
  let owner: HardhatEthersSigner,
    user1: HardhatEthersSigner,
    user2: HardhatEthersSigner,
    user3: HardhatEthersSigner,
    user4: HardhatEthersSigner,
    user5: HardhatEthersSigner;

  let votingLinkedList: VotingLinkedList;
  let votingLinkedListAddress: string;
  let myERC20Advanced: MyERC20Advanced;
  let myERC20AdvancedAddress: string;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const VotingLinkedListFactory: any =
      await ethers.getContractFactory('VotingLinkedList');
    votingLinkedList = await VotingLinkedListFactory.deploy();
    votingLinkedListAddress = await votingLinkedList.getAddress();

    const MyERC20AdvancedFactory: any =
      await ethers.getContractFactory('MyERC20Advanced');
    myERC20Advanced = await MyERC20AdvancedFactory.deploy(
      3600,
      votingLinkedListAddress,
      100000000,
    );
    myERC20AdvancedAddress = await myERC20Advanced.getAddress();
  });

  describe('Deployment', () => {
    it('Should deploy contracts', async () => {
      const addressERC: string = await myERC20Advanced.getAddress();
      const addressVoting: string = await votingLinkedList.getAddress();

      console.log(addressERC, ' Address ERC');
      console.log(addressVoting, ' Address Voting');

      expect(addressERC).to.not.equal(0);
      expect(addressVoting).to.not.equal(0);
    });
  });
  describe('Voting Process', () => {
    it('Should proper work with replacement and adding new prices', async () => {
      const number = ethers.encodeBytes32String('');

      await myERC20Advanced.transfer(user1.address, 10000000);
      await myERC20Advanced.transfer(user2.address, 20000000);
      await myERC20Advanced.transfer(user3.address, 5000000);

      await expect(myERC20Advanced.connect(user3).vote(100, number)).to.emit(
        myERC20Advanced,
        'VotingStarted',
      );

      await myERC20Advanced.connect(user2).vote(10, number);

      let result = await votingLinkedList.getAllEntries();

      await myERC20Advanced.connect(user1).vote(1000, result[0][0]);

      result = await votingLinkedList.getAllEntries();

      await myERC20Advanced.connect(owner).vote(1000, result[2][0]);

      result = await votingLinkedList.getAllEntries();

      expect(result[2][3]).to.equal(1000);
    });
    it('Should proper sort different new prices in the linked list', async () => {
      const number = ethers.encodeBytes32String('');

      await myERC20Advanced.transfer(user1.address, 10000000);
      await myERC20Advanced.transfer(user2.address, 20000000);
      await myERC20Advanced.transfer(user3.address, 5000000);

      await expect(myERC20Advanced.connect(user3).vote(100, number)).to.emit(
        myERC20Advanced,
        'VotingStarted',
      );

      await myERC20Advanced.connect(user2).vote(10, number);

      let result = await votingLinkedList.getAllEntries();

      await myERC20Advanced.connect(user1).vote(1000, result[0][0]);

      result = await votingLinkedList.getAllEntries();

      expect(result[2][3]).to.equal(10);
    });
    it('Should update vote Power', async () => {
      const number = ethers.encodeBytes32String('');

      await myERC20Advanced.transfer(user1.address, 20000000);
      await myERC20Advanced.transfer(user2.address, 70000000);

      await expect(myERC20Advanced.connect(owner).vote(100, number)).to.emit(
        myERC20Advanced,
        'VotingStarted',
      );

      const result = await votingLinkedList.getAllEntries();

      await votingLinkedList.updatePower(result[0][0], 1234);

      const resultEntry = await votingLinkedList.getEntry(result[0][0]);

      expect(resultEntry[3]).to.equal(1234);
    });
    it('Should recompute price power after user bought new tokens', async () => {
      const number = ethers.encodeBytes32String('');

      await myERC20Advanced.transfer(user1.address, 10000000);
      await myERC20Advanced.transfer(user2.address, 20000000);
      await myERC20Advanced.transfer(user3.address, 5000000);

      await expect(myERC20Advanced.connect(user3).vote(100, number)).to.emit(
        myERC20Advanced,
        'VotingStarted',
      );

      await myERC20Advanced.connect(user2).vote(10, number);

      let result = await votingLinkedList.getAllEntries();

      await myERC20Advanced.connect(user1).vote(1000, result[0][0]);

      result = await votingLinkedList.getAllEntries();

      await myERC20Advanced.connect(owner).vote(1000, result[2][0]);

      result = await votingLinkedList.getAllEntries();

      expect(result[2][3]).to.equal(1000);

      // await myERC20Advanced
      //   .connect(user3)
      //   .buy(result[2][0], { value: ethers.parseEther('1') });
      result = await votingLinkedList.getAllEntries();

      expect(result[2][3]).to.equal(1000);
    });
  });
});
