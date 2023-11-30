# The Game

**Development Stage Warning: The contracts in this repository are currently under development. Use them at your own risk.**


## Deployed contracts

Network: [Optimism Sepolia](https://sepolia-optimism.etherscan.io/)

- `Game.sol`: [xxx](https://sepolia-optimism.etherscan.io/address/xxx)

## Deploy contracts

```shell
# copy and fill the env file with the correct data
cp example.env .env
# deploy all the contracts to the testnet
npx hardhat run --network testnet scripts/deploy.ts
```

## Testing smart contracts

```shell
npm ci
npx hardhat test
```
