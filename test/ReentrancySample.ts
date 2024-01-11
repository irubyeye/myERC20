import { expect, use } from 'chai';
import { ethers, network } from 'hardhat';

import { ReentrancySample } from './../typechain-types/contracts/ReentrancySample';

import { ReentrancyProxy } from '../typechain-types/contracts/reentrancyProxy.sol/ReentrancyProxy';

describe('Reentrancy Attack', () => {
  let reentrancySample: ReentrancySample;
  let reentrancyProxy: ReentrancyProxy;
  let reentrancySampleAddress: string;
  let owner: any;
  let user1: any;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    const ReentrancySampleFactory: any =
      await ethers.getContractFactory('ReentrancySample');
    reentrancySample = await ReentrancySampleFactory.deploy();
    reentrancySampleAddress = await reentrancySample.getAddress();

    const ReentrancyProxyFactory: any =
      await ethers.getContractFactory('ReentrancyProxy');
    reentrancyProxy = await ReentrancyProxyFactory.deploy(
      user1.address,
      reentrancySampleAddress,
    );
  });

  describe('Attacks', async () => {
    it('Should withdraw ethers from ReentrancySample using reentrancy attack', async () => {
      const deposites: number[] = [100, 1];
      let reentrancySampleCurrBalance: bigint;
      let reentrancyProxyCurrBalance: bigint;

      await reentrancySample
        .connect(owner)
        .deposite({ value: ethers.parseEther(deposites[0].toString()) });

      await reentrancyProxy
        .connect(user1)
        .deposite({ value: ethers.parseEther(deposites[1].toString()) });

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(
        ethers.parseEther(deposites[1].toString()),
      );

      await reentrancyProxy
        .connect(user1)
        .depositeToSample(ethers.parseEther(deposites[1].toString()));

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(ethers.parseEther('0'));

      reentrancySampleCurrBalance = await reentrancySample.etherBalance();
      expect(reentrancySampleCurrBalance).to.equal(
        ethers.parseEther((deposites[0] + deposites[1]).toString()),
      );

      await reentrancyProxy
        .connect(user1)
        .callWithdrawBalance(reentrancySample);

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(ethers.parseEther('100'));

      reentrancySampleCurrBalance = await reentrancySample.etherBalance();
      expect(reentrancySampleCurrBalance).to.equal(ethers.parseEther('1'));
    });

    it('Should not be affected by reentrancy attack', async () => {
      const deposites: number[] = [100, 1];
      let reentrancySampleCurrBalance: bigint;
      let reentrancyProxyCurrBalance: bigint;

      await reentrancySample
        .connect(owner)
        .deposite({ value: ethers.parseEther(deposites[0].toString()) });

      await reentrancyProxy
        .connect(user1)
        .deposite({ value: ethers.parseEther(deposites[1].toString()) });

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(
        ethers.parseEther(deposites[1].toString()),
      );

      await reentrancyProxy
        .connect(user1)
        .depositeToSample(ethers.parseEther(deposites[1].toString()));

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(ethers.parseEther('0'));

      reentrancySampleCurrBalance = await reentrancySample.etherBalance();
      expect(reentrancySampleCurrBalance).to.equal(
        ethers.parseEther((deposites[0] + deposites[1]).toString()),
      );

      await reentrancyProxy.setAttackHealthy(true);

      await expect(
        reentrancyProxy
          .connect(user1)
          .callWithdrawBalanceHealthy(reentrancySample),
      ).to.be.reverted;

      reentrancyProxyCurrBalance = await reentrancyProxy.etherBalance();
      expect(reentrancyProxyCurrBalance).to.equal(ethers.parseEther('0'));

      reentrancySampleCurrBalance = await reentrancySample.etherBalance();
      expect(reentrancySampleCurrBalance).to.equal(
        ethers.parseEther((deposites[0] + deposites[1]).toString()),
      );
    });
  });
});
