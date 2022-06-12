import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { useMemo } from "react";
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
      <h2>
        <div
          style={useMemo(
            () => ({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }),
            []
          )}
        >
          <span>Orderbook</span>
          <ConnectButton />
        </div>
      </h2>
      <ExchangeOrderbook />
    </div>
  );
}
