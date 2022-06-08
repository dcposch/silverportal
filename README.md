<div class='intro-readme-only'>
# Silver Portal

![](./packages/portal-web/www/sketch/header.excalidraw.png)

</div>

<!-- Rest of this document appears on silvermirror.xyz -->

> ⚠️ This is an experimental prototype for testnet use only.

## The basic idea

**Silver Portal lets you swap ether and bitcoin, trustlessly.**

To swap ETH for BTC, you first send ETH to the exchange contract. A market maker
sends you the corresponding BTC. They post a proof to the contract, claiming the
ether.

If the market maker fails to send you your bitcoin, you get your ether
back after the escrow period, say after two days.

The other direction is even easier. You send BTC to the market maker's Bitcoin
address, then post a proof to the contract to claim your ETH.

## The details

1. **How do you prove a Bitcoin transaction on Ethereum?** Using [Bitcoin
   Mirror](https://bitcoinmirror.org), effectively a Bitcoin light client
   implemented as a smart contract.

2. **How do you provide ETH liquidity?** Post an ask. You send _N_ ETH in a
   transaction that says: here's my Bitcoin address. Anyone can buy my ether for
   bitcoin at price _M_.

3. **How do you provide BTC liquidity?** Post a bid: a promise to buy _N_ ETH
   at price _M_. You post a stake, say 10% of _N_, to make it binding. If
   someone hits your bid and you ghost, you get slashed. They get their eth back
   plus your stake.

4. **How do you withdraw liquidity?** You can withdraw liquidity at any time,
   minus any liquidity that's in escrow due to a pending transaction. More on
   that below.

5. **How do you trade ether for bitcoin?** You send a transaction that says:
   here's my bitcoin address. I'm buying _N_ bitcoin from this particular bid,
   sending _N × M_ ETH into escrow. The market maker has to send you _N_
   bitcoin within a time limit.

6. **How do you trade bitcoin for ether?** Roughly the same way. You send a
   transaction that says: I'm buying _N_ ETH. The transaction includes a
   percentage of _N_ ETH as your stake. If you fail to send bitcoin within the
   escrow period, the market maker slashes you and keeps your stake. You send
   bitcoin, wait for confirmation blocks, then post proof. This returns your
   stake plus the ETH you bought.

7. **Why do we need all this staking and slashing?** To avoid exploitation. For
   example, an attacker could spam "I'm selling ETH for BTC" transactions to
   lock up liquidity, then only complete the transaction an hour later if the
   price moves in their favor. Trades must be binding.

8. **Why does buying ETH involve two transactions?** Why can't you just send
   Bitcoin first, then post a proof? In that case, two people might hit the same
   ask at the same time, with only be enough ETH in the contract for one of
   them. A malicious MM could watch the bitcoin mempool. As soon as they see
   your buy, they also send _themselves_ bitcoin and claim the ETH ahead of you,
   keeping their BTC and stealing yours. The two-step process fixes this.

9. **What kinds of Bitcoin addresses are supported?** Currently, only P2SH (pay
   to script hash) destination addresses are supported. You can send Bitcoin
   from any address, but to receive you must use an address starting with `3` on
   mainnet or `2` on testnet.

## The risks

Every defi construct should state risks. Here are some of ours.

1. **Honest-majority assumption re: Bitcoin hashpower.** This is inherent to any
   cross-chain protocol. A successful 51% attack on Bitcoin would allow an
   attacker to drain ether from the portal. Silver Portal is an exchange, not a
   bridge, but Vitalik's [post on the security limitations of cross-chain
   bridges](https://old.reddit.com/r/ethereum/comments/rwojtk/ama_we_are_the_efs_research_team_pt_7_07_january/hrngyk8/)
   still applies. In our case, only current liquidity is at risk,
   not the entire value of a bridged asset.

2. **Smart contract risk.** These are experimental contracts. They have not been
   audited and are currently for testnet use only. Risk can be reduced over time
   through auditing, verification, and experience, but will never be zero.

3. **Censorship or extreme congestion.** Ethereum is designed for liveness
   and censorship resistance. If either of those properties fail, you may have
   sent bitcoin and be unable to prove it within the escrow window.

4. **Price exposure.** If you're providing liquidity, the standard market risks
   apply.

5. **(Mild) counterparty risk.** If you're swapping ether for bitcoin and
   there's an extreme price movement in your favor, the other party might accept
   being slashed rather than complete the trade. They may also fail to complete
   unintentionally. Either way, you'll simply get your ETH back plus slashing proceeds after the escrow period.
