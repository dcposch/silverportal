import * as React from "react";

export default function Intro() {
  return (
    <div>
      <p>
        Silver Portal is a prototype implementation of Vitalik's trustless
        exchange idea. It's an elegant construction, letting you to swap between
        two different blockchains where only one side supports smart contracts.
        In this case, we'll swap between Bitcoin and Ethereum.
      </p>
      <p>
        Anyone can run an exchange. Let's say Alice runs one. She deploys a
        contract on Ethereum and has a plain old wallet on the Bitcoin side.
      </p>
      <p>
        To swap ETH for BTC, you deposit ETH into an exchange contract. By
        default, you can take it back a day later. To keep the ETH, Alice sends
        you the corresponding amount of BTC, posting a proof to the contract.
      </p>
      <p>
        How can she prove a BTC payment on Ethereum? The contract checks
        <a href="https://bitcoinmirror.org/">Bitcoin Mirror</a>, a prototype BTC
        light client that runs on the EVM.
      </p>
      <p>
        Swapping BTC for ETH is even easier. You just send Alice some bitcoin,
        then post a proof to her exchange contract to collect ether. This
        construction is decentralized, no oracles or trusted counterparties.
      </p>
    </div>
  );
}
