# Silver Portal

![](./design/header.excalidraw.png)

> :warning: This is an experimental implementation for testnet use only.

**Silver Portal lets you swap ether for bitcoin or vice versa, trustlessly.**

## The basic idea

This is yet another idea stolen from Vitalik. In a post I can no longer find, he
described an elegant way to swap across two chains where only one side supports
smart contracts.

To swap ETH for BTC, you send ETH to a contract. A market maker sends you the
corresponding amount of BTC. They post a proof to the contract, claiming the
ether. If the market maker fails to send you your bitcoin, you get your ether
back after the escrow period, say after two days.

The other direction is even easier. You send BTC to the market maker's Bitcoin
address, then post a proof to the contract to claim your ETH.

## The details

1. **How do you prove a Bitcoin transaction on Ethereum?** We use [Bitcoin
   Mirror](https://bitcoinmirror.org), effectively a Bitcoin light client
   implemented as a smart contract.

2. **How do you provide eth liquidity?** Send a transaction that says: I'm
   posting the _N_ ether sent with this transaction. Here's my Bitcoin address.
   Anyone can send bitcoin to claim my ether, until I run out, at price _M_.

3. **How do you withdraw liquidity?** You can withdraw liquidity at any time,
   minus any liquidity that's in escrow due to a pending transaction. More on
   that below.

4. **How do you provide bitcoin liquidity?** Send a transaction that says: I
   promise to sell up to _N_ bitcoin at price _M_. I'm posting ETH worth a
   percentage of the total value as stake: if someone trades with me and I fail
   to send the Bitcoin I owe them, they'll get their ether back plus some of my
   stake (I'll be slashed).

5. **How do you trade ether for bitcoin?** Send a transaction that says: I am
   buying _n_ bitcoin from this particular LP at their stated price. Of course,
   the frontend (or your bot, etc) will automatically chose the LP with the best
   price. The transaction sends _n × m_ eth into escrow and specifies a target
   bitcoin address. The LP will send you the correct amount of bitcoin before
   the end of escrow, or you get your ether back plus a portion of their stake.

6. **How do you trade bitcoin for ether?** Roughly the same way. You send a
   transaction that says "I'm buying _n_ eth from this LP. I promise to send
   them the right amount of bitcoin shortly." The transaction includes a
   fraction of _n_ ether as your stake. If you fail to send the bitcoin within
   the escrow period, you are slashed and the LP keeps your stake. You send the
   bitcoin, wait for it to confirm, then post a second transaction saying
   "Here's proof, I'm collecting my ether now." This gives you your stake back
   plus the ether you bought.

7. **Why do we need all this staking and slashing?** To avoid exploitation. For
   example, an attacker could spam "I'm trading bitcoin for eth" transactions
   to lock up LP ether, then only complete the transaction if the ETH-BTC price
   goes up over the next hour. Bitcoin transactions settle slowly, and the price
   can move substantially during that time. Therefore, trades must be binding.

8. **Why can't you just send bitcoin, then post a proof to collect your eth?**
   Why does trading bitcoin for eth involve two separate transactions? This
   avoids an exploitable race condition. Two people might send bitcoin to the
   same LP at the same time, and there would only be enough eth in the contract
   for one of them. This can happen accidentally or on purpose: a malicious LP
   could watch the bitcoin mempool. As soon as they see your transaction, they
   also send _themselves_ bitcoin and claim the eth ahead of you, stealing your
   bitcoin. The two-step process fixes this.

9. **What kinds of Bitcoin addresses are supported?** Only P2SH (pay to script
   hash) addresses are supported.

## The risks

Every defi construct should state its known risks! Here are some Silver Portal
risks:

1. **Honest-majority assumption re: Bitcoin hashpower.** This is inherent to any
   cross-chain protocol where one side is proof-of-work. A successful 51% attack
   on Bitcoin would allow an attacker to drain ether from the portal. Silver
   Portal is an exchange but Vitalik's [post on the security limitations of
   cross-chain
   bridges](https://old.reddit.com/r/ethereum/comments/rwojtk/ama_we_are_the_efs_research_team_pt_7_07_january/hrngyk8/)
   still applies. Unlike a bridge, though, where the entire value of the bridged
   asset is at risk, here only currently-posted liquidity is be at risk.

2. **Smart contract risk.** These are experimental contracts. They have not been
   audited and are for testnet use only. Risk can be reduced over time through
   audit, verification, and experience, but will never be zero.

3. **Censorship or extreme congestion.** Ethereum is designed for liveness
   and censorship resistance. If either of those properties fail, you may have
   sent bitcoin and be unable to prove it within the escrow window.

4. **Price exposure.** If you're providing liquidity, the standard risks apply.

5. **(Mild) counterparty risk.** If you're swapping ether for bitcoin and
   there's an extreme price movement in your favor, market makers might choose
   to accept being slashed rather than complete the trade. Market makers might
   also fail to complete unintentionally. Either way, you'll simply get your
   ether back after the escrow period plus a portion of their stake.
