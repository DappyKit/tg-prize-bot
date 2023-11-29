import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Prize', function () {
  async function deployPrizeFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Prize = await ethers.getContractFactory('Prize');
    const prize = await Prize.deploy(7, 10); // maxClaimDays=7, commissionPercentage=10

    return { prize, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should set the right owner and parameters', async function () {
      const { prize, owner } = await loadFixture(deployPrizeFixture);

      expect(await prize.creator()).to.equal(owner.address);
      expect(await prize.maxClaimDays()).to.equal(7);
      expect(await prize.commissionPercentage()).to.equal(10);
    });
  });

  // describe('Create Prize', function () {
  //   it('Should create a prize and calculate commission correctly', async function () {
  //     const { prize, owner } = await loadFixture(deployPrizeFixture);
  //     const prizeAmount = ethers.parseEther('1.0');
  //
  //     await prize.connect(owner).create([1, 2, 3], 5, 1672531200, { value: prizeAmount });
  //
  //     const prizeId = await prize.getPrizesLength();
  //     const prizeData = await prize.prizes(prizeId);
  //     console.log(prizeData)
  //     // const expectedCommission = prizeAmount.div(10); // 10% commission
  //     //
  //     // expect(prizeData.prizeTotalAmount).to.equal(prizeAmount.sub(expectedCommission));
  //   });
  // });

  // describe('Claim Prize', function () {
  //   it('Should allow claiming a prize', async function () {
  //     const { prize, owner, otherAccount } = await loadFixture(deployPrizeFixture);
  //     const prizeAmount = ethers.parseEther('1.0');
  //
  //     await prize.connect(owner).create([1, 2, 3], 5, 1672531200, { value: prizeAmount });
  //     const prizeId = await prize.getPrizesLength() - 1;
  //
  //     // Assuming some signature verification logic is implemented
  //     await prize.connect(otherAccount).claim(prizeId, 123, '0x00');
  //
  //     expect(await prize.balances(otherAccount.address)).to.be.above(0);
  //   });
  // });

  describe('Claim Earnings', function () {
    it('Should allow the creator to claim earnings', async function () {
      const { prize, owner } = await loadFixture(deployPrizeFixture);
      const prizeAmount = ethers.parseEther('1.0');

      await prize.connect(owner).create([1, 2, 3], 5, 1672531200, { value: prizeAmount });
      await prize.connect(owner).claimEarnings();

      expect(await prize.earned()).to.equal(0);
    });
  });
});
