import { ethers } from 'hardhat'
import 'dotenv/config'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  // deploy Prize
  console.log('Deploying Prize...')
  const socialConnections = await ethers.deployContract('Prize', [7, 10])
  await socialConnections.waitForDeployment()
  console.log(`Prize deployed to ${socialConnections.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
