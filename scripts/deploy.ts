import { ethers } from 'hardhat'
import 'dotenv/config'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // deploy Prize
  console.log('Deploying Game...')
  const gameContract = await ethers.deployContract('Game')
  await gameContract.waitForDeployment()
  console.log(`Game deployed to ${gameContract.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
