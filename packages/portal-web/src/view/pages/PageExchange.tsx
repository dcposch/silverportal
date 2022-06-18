import "./PageExchange.css";

import { ConnectButton, useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { factories } from "../../../types/ethers-contracts";
import Exchange from "../exchange/Exchange";
import { portalContractAddr } from "../../model/PortalParams";

export default function PageExchange() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { data: account } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const portal = React.useMemo(() => {
    console.log("Contract " + (signer ? "ready to transact" : "read-only"));
    return factories.Portal__factory.connect(
      portalContractAddr,
      signer || provider
    );
  }, [signer, provider]);

  return (
    <div>
      <blockquote>
        <p>
          🚀 Trade Ropsten, an advanced proof-of-stake asset, for testnet
          bitcoin.
        </p>
      </blockquote>
      <Exchange
        portal={portal}
        connectedAddress={account ? account.address : undefined}
        addRecentTransaction={addRecentTransaction}
      />

      <h2>Connect</h2>
      <div className="exchange-row">
        <ConnectEthereum />
      </div>
      <div className="exchange-row">
        <ConnectBitcoin />
      </div>
    </div>
  );
}

function ConnectEthereum() {
  return (
    <div>
      <label>Ethereum, Ropsten testnet</label>
      <div className="exchange-row">
        <ConnectButton />
      </div>
    </div>
  );
}

function ConnectBitcoin() {
  return (
    <div>
      <label>Bitcoin Testnet</label>
      <div className="exchange-row">
        The easiest way to use Bitcoin Testnet is to create a wallet on{" "}
        <a href="https://block.io/dashboard/btctest">Block.io</a>. The address
        should start with <code>2</code>. You can get testnet BTC from{" "}
        <a href="https://testnet.help/en/btcfaucet/testnet">this faucet</a>.
      </div>
    </div>
  );
}
