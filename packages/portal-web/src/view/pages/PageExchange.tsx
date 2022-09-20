import "./PageExchange.css";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { factories } from "../../../types/ethers-contracts";
import { contractAddrs } from "../../utils/contracts";
import Exchange from "../exchange/Exchange";
import ConnectSection from "../exchange/ConnectSection";

export default function PageExchange() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const contracts = React.useMemo(() => {
    console.log(signer ? "Ready to transact" : "Read-only", signer, provider);
    const read = {
      portal: factories.Portal__factory.connect(contractAddrs.portal, provider),
      wbtc: factories.ERC20__factory.connect(contractAddrs.wbtc, provider),
    };
    let write = undefined;
    if (signer) {
      write = {
        portal: factories.Portal__factory.connect(contractAddrs.portal, signer),
        wbtc: factories.ERC20__factory.connect(contractAddrs.wbtc, signer),
      };
    }
    return { read, write };
  }, [signer, provider]);

  return (
    <div>
      <blockquote>
        <p>
          🚀 Trade Ropsten, an advanced proof-of-stake asset, and testnet
          bitcoin.
        </p>
      </blockquote>
      <Exchange
        contracts={contracts}
        connectedAddress={address}
        addRecentTransaction={addRecentTransaction}
      />
      <ConnectSection />
    </div>
  );
}
