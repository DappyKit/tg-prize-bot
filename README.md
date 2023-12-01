# The Game

**Development Stage Warning: The contracts in this repository are currently under development. Use them at your own risk.**


## Deployed contracts

Network: [Ethereum Sepolia](https://sepolia.etherscan.io/)

- `Game.sol`: [0x5fBB70702d4C96B40C6bCa75CaBe50E5c8A07599](https://sepolia.etherscan.io/address/0x5fBB70702d4C96B40C6bCa75CaBe50E5c8A07599)

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
