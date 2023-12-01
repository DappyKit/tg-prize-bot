import { ethers } from 'hardhat'
import 'dotenv/config'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // deploy Game
  console.log('Deploying Game...')
  const gameContract = await ethers.deployContract('Game', [5, 1800, 3600])
  await gameContract.waitForDeployment()
  console.log(`Game deployed to ${gameContract.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
