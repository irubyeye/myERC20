import { MerkleRootVesting } from './../typechain-types/contracts/MerkleRootVesting';
import { expect, use } from 'chai';
import { ethers, network } from 'hardhat';
import { MyERC20 } from '../typechain-types/contracts/MyERC20';
import { keccak256 } from 'ethers';
import { AbiCoder } from 'ethers';
import { MerkleTree } from 'merkletreejs';

describe('Merkle root vesting', () => {
  let owner: any, user1: any, user2: any, user3: any, user4: any, user5: any;
  let merkleRootVesting: MerkleRootVesting;
  let merkleRootVestingAddress: string;
  let myERC20: MyERC20;
  let myERC20Address: string;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const MyERC20Factory: any = await ethers.getContractFactory('MyERC20');
    myERC20 = await MyERC20Factory.deploy(3600);
    myERC20Address = await myERC20.getAddress();

    const merkleRootVestingFactory: any =
      await ethers.getContractFactory('MerkleRootVesting');
    merkleRootVesting = await merkleRootVestingFactory.deploy(
      myERC20Address,
      63072000,
    );
    merkleRootVestingAddress = await merkleRootVesting.getAddress();

    await myERC20.connect(owner).transfer(merkleRootVestingAddress, 100000000);
  });

  describe('Deployment', () => {
    it('Should deploy contracts', async () => {
      const addressERC: string = await myERC20.getAddress();
      const addressVesting: string = await merkleRootVesting.getAddress();

      expect(addressERC).to.not.equal(0);
      expect(addressVesting).to.not.equal(0);
    });

    it('Should populate vesting', async () => {
      const userAddresses: string[] = [user1.address, user2.address];
      const amounts: number[] = [10000000, 20000000];

      const vestingData = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[0], amounts[0]],
      );

      const vestingData1 = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[1], amounts[1]],
      );

      const merkleTree = new MerkleTree(
        [vestingData, vestingData1],
        keccak256,
        {
          hashLeaves: true,
          sortPairs: true,
        },
      );

      const merkleRoot = merkleTree.getHexRoot();
      await merkleRootVesting.setVesting(merkleRoot);

      expect(await merkleRootVesting.getMerkleRoot()).to.equal(merkleRoot);
    });
    it('Should decline claim tokens when cliff is not ended', async () => {
      const userAddresses: string[] = [user1.address, user2.address];
      const amounts: number[] = [10000000, 20000000];

      const vestingData = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[0], amounts[0]],
      );

      const vestingData1 = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[1], amounts[1]],
      );

      const merkleTree = new MerkleTree(
        [vestingData, vestingData1],
        keccak256,
        {
          hashLeaves: true,
          sortPairs: true,
        },
      );

      const merkleRoot = merkleTree.getHexRoot();
      await merkleRootVesting.setVesting(merkleRoot);

      expect(await merkleRootVesting.getMerkleRoot()).to.equal(merkleRoot);

      await expect(
        merkleRootVesting
          .connect(user1)
          .claim(amounts[0], merkleTree.getHexProof(keccak256(vestingData))),
      ).to.be.revertedWith('You are not allowed to perform this!');
    });
    it('Should transfer approved amount of tokens to auth person', async () => {
      const userAddresses: string[] = [user1.address, user2.address];
      const amounts: number[] = [10000000, 20000000];

      const vestingData = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[0], amounts[0]],
      );

      const vestingData1 = ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddresses[1], amounts[1]],
      );

      const merkleTree = new MerkleTree(
        [vestingData, vestingData1],
        keccak256,
        {
          hashLeaves: true,
          sortPairs: true,
        },
      );

      const merkleRoot = merkleTree.getHexRoot();
      await merkleRootVesting.setVesting(merkleRoot);

      await network.provider.send('evm_increaseTime', [63072000]);
      await network.provider.send('evm_mine', []);

      await merkleRootVesting
        .connect(user1)
        .claim(amounts[0], merkleTree.getHexProof(keccak256(vestingData)));

      expect(await myERC20.balanceOf(user1)).to.equal(amounts[0]);
    });
  });
});
