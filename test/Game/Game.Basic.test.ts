import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Game', function () {
  async function deployGameFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Game = await ethers.getContractFactory('Game');
    const game = await Game.deploy();

    return { game, owner, otherAccount };
  }

  describe('verify', function () {
    it('should successfully verify a valid signature', async function () {
      const { game, owner } = await loadFixture(deployGameFixture);

      const byteData = 2;
      const gameId = 11;
      const dataHash = ethers.solidityPackedKeccak256(['uint8', 'uint256'], [byteData, gameId]);
      const messageBytes = Buffer.from(dataHash.slice(2), 'hex');
      const signature = await owner.signMessage(messageBytes);

      await expect(game.verify(byteData, gameId, signature)).to.not.be.reverted;
    });

    it('should reject an invalid signature', async function () {
      const { game, owner, otherAccount } = await loadFixture(deployGameFixture);

      const byteData = 2;
      const gameId = 11;
      const dataHash = ethers.solidityPackedKeccak256(['uint8', 'uint256'], [byteData, gameId]);
      const signature = await otherAccount.signMessage(dataHash);

      await expect(game.verify(byteData, gameId, signature)).to.be.revertedWith('Invalid signature');
    });

    it('should reject a signature from a different account', async function () {
      const { game, owner, otherAccount } = await loadFixture(deployGameFixture);

      const byteData = 2;
      const gameId = 11;
      const dataHash = ethers.solidityPackedKeccak256(['uint8', 'uint256'], [byteData, gameId]);
      const signature = await owner.signMessage(dataHash);

      await expect(game.connect(otherAccount).verify(byteData, gameId, signature)).to.be.revertedWith('Invalid signature');
    });
  });
});
