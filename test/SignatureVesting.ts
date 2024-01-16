import { SignatureVesting } from './../typechain-types/contracts/SignatureVesting';
import { expect, use } from 'chai';
import { ethers, hardhatArguments, network } from 'hardhat';
import { MyERC20 } from '../typechain-types/contracts/MyERC20';
import { keccak256 } from 'ethers';

describe('Signature vesting', () => {
  let owner: any, user1: any, user2: any, user3: any, user4: any, user5: any;
  let signatureVesting: SignatureVesting;
  let signatureVestingAddress: string;
  let myERC20: MyERC20;
  let myERC20Address: string;
  let randomChainId: bigint;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();
    randomChainId = BigInt(
      keccak256(
        ethers.solidityPacked(
          ['uint256', 'uint256'],
          [Date.now(), Math.round(Math.random() * 100000000)],
        ),
      ),
    );

    const MyERC20Factory: any = await ethers.getContractFactory('MyERC20');
    myERC20 = await MyERC20Factory.deploy(3600);
    myERC20Address = await myERC20.getAddress();

    const signatureVestingFactory: any =
      await ethers.getContractFactory('SignatureVesting');
    signatureVesting = await signatureVestingFactory.deploy(
      myERC20Address,
      63072000,
      randomChainId,
    );
    signatureVestingAddress = await signatureVesting.getAddress();

    await myERC20.connect(owner).transfer(signatureVestingAddress, 100000000);
  });

  describe('Deployment', () => {
    it('Should deploy contracts', async () => {
      const addressERC: string = await myERC20.getAddress();
      const addressVesting: string = await signatureVesting.getAddress();
      const chainId: string = await signatureVesting.getChainId();

      expect(await myERC20.balanceOf(signatureVesting)).to.equal(100000000);
      expect(chainId).to.equal(randomChainId);
      expect(addressERC).to.not.equal(0);
      expect(addressVesting).to.not.equal(0);
    });
    it('Should decline claim tokens when cliff is not ended', async () => {
      const userAddresses: string[] = [user1.address, user2.address];
      const amounts: number[] = [10000000, 20000000];
    });
    it('Should transfer approved amount of tokens to auth person', async () => {
      const userAddresses: string[] = [user1.address, user2.address];
      const amounts: number[] = [10000000, 20000000];

      const message = keccak256(
        ethers.solidityPacked(
          ['address', 'uint256', 'uint256', 'uint256', 'address'],
          [
            userAddresses[0],
            amounts[0],
            0,
            randomChainId,
            signatureVestingAddress,
          ],
        ),
      );
      await network.provider.send('evm_increaseTime', [63072000]);
      await network.provider.send('evm_mine', []);

      const sign = await owner.signMessage(message);

      const recoverAddress = ethers.verifyMessage(message, sign);

      expect(recoverAddress).to.equal(owner.address);

      // await signatureVesting
      //   .connect(user1)
      //   .claim(amounts[0], 0, randomChainId, sign, signatureVestingAddress);

      // expect(await myERC20.balanceOf(user1)).to.equal(amounts[0]);

      const blockMsg = await signatureVesting
        .connect(user1)
        .recoveringResult(
          amounts[0],
          0,
          randomChainId,
          sign,
          signatureVestingAddress,
          message,
        );

      expect(blockMsg).to.equal(owner.address);
    });
  });
});
