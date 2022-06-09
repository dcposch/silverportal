import { ethers } from "ethers";
import * as React from "react";
import { factories, Portal } from "../../types/ethers-contracts";

type OrderT = [
  string,
  ethers.BigNumber,
  ethers.BigNumber,
  string,
  ethers.BigNumber
];

interface ExchangeState {
  orders: OrderT[];
}

export default class Exchange extends React.PureComponent<{}, ExchangeState> {
  portal: Portal;

  constructor(props: {}) {
    super(props);
    this.state = {
      orders: [],
    };

    const network = "ropsten";
    const contract = "0x326122a2d043e9c1af83841e53a15175ca75709b";
    const provider = ethers.getDefaultProvider(network);
    this.portal = factories.Portal__factory.connect(contract, provider);

    this.loadOrderbook();
  }

  async loadOrderbook() {
    const n = (await this.portal.nextOrderID()).toNumber();

    const promises = [] as Promise<OrderT>[];
    for (let i = 0; i < n; i++) {
      promises.push(this.portal.orderbook(i));
    }
    const orders = await Promise.all(promises);
    this.setState({ orders });
  }

  render() {
    const orderbook = this.state.orders.map((o, i) => {
      const amountSats = o[1].toNumber();
      const priceWeiPerSat = o[2].toNumber();

      const type = amountSats < 0 ? "ASK" : " BID";
      const amount = Math.abs(amountSats / 1e8).toFixed(8);
      const price = ((priceWeiPerSat * 1e8) / 1e18).toFixed(4);
      return (
        <div key={i}>
          <strong>{type}</strong> {price} for {amount} BTC
        </div>
      );
    });

    return (
      <div>
        <blockquote>
          <p>
            🚀 Trade Ropsten, an advanced proof-of-stake asset, for testnet
            bitcoin.
          </p>
        </blockquote>
        <h2>Orderbook</h2>
        {orderbook}
      </div>
    );
  }
}
