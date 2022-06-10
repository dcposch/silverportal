import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";
import ExchangeOrderbook from "./ExchangeOrderbook";

export default function Exchange() {
  return (
    <div>
      <blockquote>
        <p>
          🚀 Trade Ropsten, an advanced proof-of-stake asset, for testnet
          bitcoin.
        </p>
      </blockquote>
      <ConnectButton />
      <h2>Orderbook</h2>
      <ExchangeOrderbook />
    </div>
  );
}
