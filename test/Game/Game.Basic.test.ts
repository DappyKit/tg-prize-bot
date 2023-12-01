import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('Game', function () {
  const feePercentage = 5
  const revealSeconds = 300 // 5 minutes
  const returnSeconds = 600 // 10 minutes

  async function deployGameFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const Game = await ethers.getContractFactory('Game')
    const game = await Game.deploy(feePercentage, revealSeconds, returnSeconds)

    return {game, owner, otherAccount}
  }

  describe('create', function () {
    it('should allow a user to create a game', async function () {
      ethers.AbiCoder.defaultAbiCoder().encode([], [])

      const {game, owner} = await loadFixture(deployGameFixture)
      const gameId = ethers.id('game1')
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes('secret'))
      const tx = await game.connect(owner).create(gameId, secretHash, {value: ethers.parseEther('1')})
      await expect(tx).to.emit(game, 'GameCreated').withArgs(gameId, owner.address)
    })
  })

  describe('bet', function () {
    it('should not allow a user to place a bet on a non-existent game', async function () {
      const {game, otherAccount} = await loadFixture(deployGameFixture)
      const gameId = ethers.id('game1')
      const betValue = 2
      const betAmount = ethers.parseEther('1')

      await expect(game.connect(otherAccount).bet(gameId, betValue, {value: betAmount}))
          .to.be.revertedWith('Game does not exist or has ended')
    })
  })

  describe('reveal', function () {
    it('should allow the game creator to reveal the game, nobody wins', async function () {
      const {game, owner, otherAccount} = await loadFixture(deployGameFixture)
      const gameId = ethers.id('game1')
      const betValue = 2
      const secret = ethers.encodeBytes32String('secret')
      // const secretHash = ethers.keccak256(secret)

      const dataHash = ethers.solidityPackedKeccak256(['uint256', 'uint8', 'bytes32'], [gameId, betValue, secret])
      const secretHash = Buffer.from(dataHash.slice(2), 'hex')

      // Create the game
      await game.connect(owner).create(gameId, secretHash, {value: ethers.parseEther('1')})

      const gameData = await game.games(gameId)
      const betAmount = gameData[3]

      // Other player places a bet
      await game.connect(otherAccount).bet(gameId, betValue, {value: betAmount})

      // Skip time to allow reveal
      await ethers.provider.send('evm_increaseTime', [revealSeconds - 10])
      await ethers.provider.send('evm_mine')

      // Reveal the game
      await expect(game.connect(owner).reveal(gameId, betValue, secret))
          .to.emit(game, 'GameEnded')
          .withArgs(gameId, '0x0000000000000000000000000000000000000000')
    })

    it('should allow the game creator to reveal the game, second player wins', async function () {
      const {game, owner, otherAccount} = await loadFixture(deployGameFixture)
      const gameId = ethers.id('game1')
      const creatorBetValue = 1
      const opponentBetValue = 2
      const secret = ethers.encodeBytes32String('secret')

      const user2InitialBalance = await ethers.provider.getBalance(otherAccount.address)

      const dataHash = ethers.solidityPackedKeccak256(['uint256', 'uint8', 'bytes32'], [gameId, creatorBetValue, secret])
      const secretHash = Buffer.from(dataHash.slice(2), 'hex')

      // Create the game with the creator's bet
      await game.connect(owner).create(gameId, secretHash, {value: ethers.parseEther('1')})

      // Get the bet amount from the created game
      const gameData = await game.games(gameId)
      const betAmount = gameData[3]

      // Other player places a bet
      await game.connect(otherAccount).bet(gameId, opponentBetValue, {value: betAmount})

      // Skip time to allow reveal
      await ethers.provider.send('evm_increaseTime', [revealSeconds - 10])
      await ethers.provider.send('evm_mine')

      // Get initial balance of the opponent
      const initialBalance = await ethers.provider.getBalance(otherAccount.address)

      // Reveal the game
      const tx = await game.connect(owner).reveal(gameId, creatorBetValue, secret)

      // Get updated balance of the opponent
      const updatedBalance = await ethers.provider.getBalance(otherAccount.address)
      expect(updatedBalance).to.be.greaterThan(user2InitialBalance)

      // Check the emitted event for the correct winner
      await expect(tx)
          .to.emit(game, 'GameEnded')
          .withArgs(gameId, otherAccount.address)
    })

    it('should allow the game creator to reveal the game, first player wins', async function () {
      const {game, owner, otherAccount} = await loadFixture(deployGameFixture)
      const gameId = ethers.id('game1')
      const creatorBetValue = 2
      const opponentBetValue = 1
      const secret = ethers.encodeBytes32String('secret')

      const user2InitialBalance = await ethers.provider.getBalance(otherAccount.address)

      const dataHash = ethers.solidityPackedKeccak256(['uint256', 'uint8', 'bytes32'], [gameId, creatorBetValue, secret])
      const secretHash = Buffer.from(dataHash.slice(2), 'hex')

      // Create the game with the creator's bet
      await game.connect(owner).create(gameId, secretHash, {value: ethers.parseEther('1')})

      // Get the bet amount from the created game
      const gameData = await game.games(gameId)
      const betAmount = gameData[3]

      // Other player places a bet
      await game.connect(otherAccount).bet(gameId, opponentBetValue, {value: betAmount})

      // Skip time to allow reveal
      await ethers.provider.send('evm_increaseTime', [revealSeconds - 10])
      await ethers.provider.send('evm_mine')

      // Get initial balance of the opponent
      const initialBalance = await ethers.provider.getBalance(otherAccount.address)

      // Reveal the game
      const tx = await game.connect(owner).reveal(gameId, creatorBetValue, secret)

      // Get updated balance of the opponent
      const updatedBalance = await ethers.provider.getBalance(otherAccount.address)
      expect(updatedBalance).to.be.lessThan(user2InitialBalance)

      // Check the emitted event for the correct winner
      await expect(tx)
          .to.emit(game, 'GameEnded')
          .withArgs(gameId, owner.address)
    })
  })

})
