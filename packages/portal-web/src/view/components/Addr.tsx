import "./components.css";

import * as React from "react";
import { formatBitcoinAddr } from "../../utils/bitcoin-addr";

/**
 * Displays a Bitcoin address.
 */
export default function Addr({
  addr,
  scriptHash,
  network,
}: {
  addr?: string;
  scriptHash?: string;
  network?: "mainnet" | "testnet";
}) {
  if (!addr) {
    addr = formatBitcoinAddr(scriptHash, network);
  }

  return <code className="component-addr">{addr}</code>;
}
