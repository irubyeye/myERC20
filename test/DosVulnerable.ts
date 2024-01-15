import { expect, use } from 'chai';
import { ethers, network } from 'hardhat';

import { DosVulnerable } from './../typechain-types/contracts/DosVulnerable';

import { any } from 'hardhat/internal/core/params/argumentTypes';

import { toBeHex, toQuantity } from 'ethers';

describe.skip('Dos Attack', () => {
  let dosVulnerable: DosVulnerable;
  let owner: any, user1: any, user2: any, user3: any, user4: any, user5: any;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const DosVulnerableFactory: any =
      await ethers.getContractFactory('DosVulnerable');
    dosVulnerable = await DosVulnerableFactory.deploy(100);
  });

  describe('Attack', () => {
    it('Should be affected by Dos attack', async () => {
      const limitGas: number = 50000;

      await dosVulnerable.connect(user4).buy({ value: ethers.parseEther('1') });
      await dosVulnerable.connect(user1).buy({ value: ethers.parseEther('1') });
      await dosVulnerable.connect(user2).buy({ value: ethers.parseEther('1') });
      await dosVulnerable.connect(user3).buy({ value: ethers.parseEther('1') });
      await dosVulnerable.connect(owner).buy({ value: ethers.parseEther('1') });
      await dosVulnerable.connect(user5).buy({ value: ethers.parseEther('1') });

      await dosVulnerable.connect(user4).transferTo(user1, 1);
      await dosVulnerable.connect(user4).transferTo(user1, 1);
      await dosVulnerable.connect(user4).transferTo(user1, 1);

      await dosVulnerable.connect(user1).transferTo(owner, 1);
      await dosVulnerable.connect(user1).transferTo(owner, 1);
      await dosVulnerable.connect(user1).transferTo(owner, 1);

      await dosVulnerable.connect(user2).transferTo(owner, 1);
      await dosVulnerable.connect(user2).transferTo(owner, 1);
      await dosVulnerable.connect(user2).transferTo(owner, 1);

      await dosVulnerable.connect(user3).transferTo(owner, 1);
      await dosVulnerable.connect(user3).transferTo(owner, 1);
      await dosVulnerable.connect(user3).transferTo(owner, 1);

      await dosVulnerable.connect(user5).transferTo(owner, 1);
      await dosVulnerable.connect(user5).transferTo(owner, 1);
      await dosVulnerable.connect(user5).transferTo(owner, 1);

      await expect(dosVulnerable.connect(user4).sell(1)).to.be.revertedWith(
        'You are blocked!',
      );

      await network.provider.send('evm_setBlockGasLimit', [
        toQuantity(limitGas),
      ]);

      await expect(dosVulnerable.connect(owner).sell(1, { gasLimit: limitGas }))
        .to.be.reverted;
    });
  });
});
