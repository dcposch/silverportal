import * as React from "react";

/** Link to a verified contract on Etherscan */
export default function ViewContractLink({
  network,
  contract,
}: {
  network: string;
  contract: string;
}) {
  const etherscanUrl = `https://${
    network === "mainnet" ? "" : network + "."
  }etherscan.io`;
  return (
    <a target="_blank" href={`${etherscanUrl}/address/${contract}#code`}>
      ↗ View contract on Etherscan
    </a>
  );
}
