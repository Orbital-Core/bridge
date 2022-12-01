# Orbital Bridge

## Run Tests

```shell
npx hardhat test
```

## Deploy to Testnet

```
npx hardhat --network sepolia deploy --tags deploy
```

## Deposit to Bridge

```
npx hardhat --network sepolia deploy --tags deposit
```

## Addresses

Addresses can be found in `deployments` directory.

## Verify Contract

```
npx hardhat --network sepolia etherscan-verify 
```