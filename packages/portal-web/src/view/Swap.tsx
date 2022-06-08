import * as React from "react";

export default class Swap extends React.PureComponent {
  constructor(props: {}) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>Rinkeby ETH to testnet BTC</h1>
        <p></p>
        <p>View contract on Etherscan. ETH available: 21.35</p>
        <p>View Bitcoin address. BTC available: 2.310</p>
        <p>Connect wallet to swap.</p>
        <h2>Swap XXXXX ETH</h2>
        <h2>Receiving Y BTC to ZZZZZZZZ</h2>
        <button>Swap</button>
        <p>
          If you don't get your BTC, you'll be able to withdraw your ETH again
          after a day.
        </p>
        <p>Total ETH sent: 0 ... in escrow: 0 ... available to withdraw: 0</p>
        <p>Total BTC received: 0</p>
        <h2>Transactions</h2>
        <p>Table goes here, maybe.</p>
      </div>
    );
  }
}
