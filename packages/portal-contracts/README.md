## Silver Portal contracts

- **Portal** implements a limit order book.

We could add a second contract, PortalPosition, to make orders and escrows NFTs
similar to the Uniswap v3 LP NFTs. Unclear if that would add value: both are
tied to an external Bitcoin address that doesn't transfer with the NFT. Might
still be useful for fast liquidity. For example, if you sent BTC to receive ETH
at some price, instead of waiting an hour for block confirmations, you could
sell the escrow at a slight discount to get ETH immediately.

## Quick start

```
forge test -vv
```

## Deployment

Ensure that `ETHERSCAN_API_KEY` is set.

```
forge script PortalDeploy -f $ETH_RPC_URL_ROPSTEN --private-key $MY_DEPLOYER_PRIVKEY
```

> TODO: adding `--verify` currently does not work. Verify manually on Etherscan.
