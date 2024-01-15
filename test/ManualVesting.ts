import { ManualVesting } from './../typechain-types/contracts/ManualVesting';
import { expect, use } from 'chai';
import { ethers, network } from 'hardhat';
import { MyERC20 } from '../typechain-types/contracts/MyERC20';

describe('Manual vesting', () => {
  let owner: any, user1: any, user2: any, user3: any, user4: any, user5: any;
  let manualVesting: ManualVesting;
  let manualVestingAddress: string;
  let myERC20: MyERC20;
  let myERC20Address: string;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const MyERC20Factory: any = await ethers.getContractFactory('MyERC20');
    myERC20 = await MyERC20Factory.deploy(3600);
    myERC20Address = await myERC20.getAddress();

    const manualVestingFactory: any =
      await ethers.getContractFactory('ManualVesting');
    manualVesting = await manualVestingFactory.deploy(myERC20Address, 63072000);
    manualVestingAddress = await manualVesting.getAddress();

    await myERC20.connect(owner).transfer(manualVestingAddress, 100000000);
  });

  describe('Deployment', () => {
    it('Should deploy contracts', async () => {
      const addressERC: string = await myERC20.getAddress();
      const addressVesting: string = await manualVesting.getAddress();

      expect(addressERC).to.not.equal(0);
      expect(addressVesting).to.not.equal(0);
    });

    it('Should populate vesting', async () => {
      const userAddresses: string[] = [
        user1.address,
        user2.address,
        user3.address,
      ];
      const amounts: number[] = [10000000, 20000000, 30000000];

      await manualVesting.populateVesting(userAddresses, amounts);

      expect(await manualVesting.connect(user1).getClaimAmount()).to.equal(
        amounts[0],
      );
    });
    it('Should decline claim tokens when cliff is not ended', async () => {
      const userAddresses: string[] = [
        user1.address,
        user2.address,
        user3.address,
      ];
      const amounts: number[] = [10000000, 20000000, 30000000];

      await manualVesting.populateVesting(userAddresses, amounts);

      await expect(
        manualVesting.connect(user1).claim(amounts[0]),
      ).to.be.revertedWith('Can not claim!');
    });
    it('Should transfer approved amount of tokens to auth person', async () => {
      const userAddresses: string[] = [
        user1.address,
        user2.address,
        user3.address,
      ];
      const amounts: number[] = [10000000, 20000000, 30000000];

      await manualVesting.populateVesting(userAddresses, amounts);

      await network.provider.send('evm_increaseTime', [63072000]);
      await network.provider.send('evm_mine', []);

      await manualVesting.connect(user1).claim(amounts[0]);

      expect(await myERC20.balanceOf(user1.address)).to.equal(amounts[0]);
    });
  });
});
