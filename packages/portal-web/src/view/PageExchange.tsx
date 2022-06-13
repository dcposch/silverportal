import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { useMemo } from "react";
import Exchange from "./Exchange";

export default function PageExchange() {
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
      <Exchange />
    </div>
  );
}
