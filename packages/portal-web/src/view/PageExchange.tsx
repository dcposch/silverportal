import "./PageExchange.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";
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
        Orderbook{" "}
        <small>
          <a
            target="_blank"
            href="https://ropsten.etherscan.io/address/0x326122a2d043e9c1af83841e53a15175ca75709b#code"
          >
            ↗ View contract on Etherscan
          </a>
        </small>
      </h2>
      <Exchange />

      <h2>Connect</h2>
      <div className="exchange-two-col">
        <ConnectEthereum />
        <ConnectBitcoin />
      </div>
    </div>
  );
}

function ConnectEthereum() {
  return (
    <div>
      <label>Ethereum, Ropsten testnet</label>
      <p>
        <ConnectButton />
      </p>
    </div>
  );
}

function ConnectBitcoin() {
  return (
    <div>
      <label>Bitcoin Testnet</label>
      <p>
        The easiest way to use Bitcoin Testnet is to create a wallet on{" "}
        <a href="https://block.io/dashboard/btctest">Block.io</a>. The address
        should start with <code>2</code>. You can get testnet BTC from{" "}
        <a href="https://testnet.help/en/btcfaucet/testnet">this faucet</a>.
      </p>
    </div>
  );
}
