# DappyKit Prize Bot Example

**Development Stage Warning: The contracts in this repository are currently under development. Use them at your own risk.**

The Telegram bot that distributes prizes is an example of the practical application of the DappyKit SDK. It allows for the fair distribution of crypto-prizes on EVM networks among subscribers of Telegram channels. **A key feature** of this project is that **winners do not need to have their own wallet in an EVM network to receive the prize**, nor do they need to understand how to fund their balance for transactions.

Thanks to **ERC-4337** technology, a wallet will be automatically created based on the Telegram user's identifier. With the integration of DappyKit technology, a **Telegram identifier becomes a gasless wallet** for the individual. This approach has the **potential to attract millions of users from Telegram** to EVM networks, eliminating the complexities of creating wallets and remembering mnemonic phrases.


## Deployed contracts

Network: [Optimism Sepolia](https://sepolia-optimism.etherscan.io/)

- `Prize.sol`: [0x5fBB70702d4C96B40C6bCa75CaBe50E5c8A07599](https://sepolia-optimism.etherscan.io/address/0x5fBB70702d4C96B40C6bCa75CaBe50E5c8A07599)

## Deploy contracts

```shell
# copy and fill the env file with the correct data
cp example.env .env
# deploy all the contracts to the testnet
npx hardhat run --network testnet scripts/deploy.ts
```

## Testing smart contracts without ERC-4337

```shell
npm ci
npx hardhat test
```
