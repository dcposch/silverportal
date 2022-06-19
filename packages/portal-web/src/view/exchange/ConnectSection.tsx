import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";

export default function ConnectSection() {
  return (
    <div>
      <h2>Connect</h2>
      <div className="exchange-two-col">
        <div>
          <label>Ethereum, Ropsten testnet</label>
          <ConnectButton showBalance={false} />
        </div>
        <div>
          <label>Bitcoin testnet</label>
          <div>
            Use a testnet wallet. Create a non-bech32 address, starting with 2.
          </div>
        </div>
      </div>
    </div>
  );
}
