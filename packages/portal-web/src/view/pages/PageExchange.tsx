import "./PageExchange.css";

import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { factories, IERC20, Portal } from "../../../types/ethers-contracts";
import { contractAddrs } from "../../utils/constants";
import Exchange from "../exchange/Exchange";
import ConnectSection from "../exchange/ConnectSection";

export default function PageExchange() {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const portal = React.useMemo(() => {
    console.log("Contract " + (signer ? "ready to transact" : "read-only"));
    const wallet = signer || provider;
    const ret = factories.Portal__factory.connect(
      contractAddrs.portal,
      wallet
    ) as Portal & { wbtc: IERC20 };
    ret.wbtc = factories.IERC20__factory.connect(contractAddrs.wbtc, wallet);
    return ret;
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
        portal={portal}
        connectedAddress={address}
        addRecentTransaction={addRecentTransaction}
      />
      <ConnectSection />
    </div>
  );
}
