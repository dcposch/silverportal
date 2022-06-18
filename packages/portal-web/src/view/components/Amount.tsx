import { BigNumber } from "ethers";
import * as React from "react";
import { toFloat64 } from "../../utils/math";

/**
 * Displays a crypto amount and symbol, eg '12.351 ETH' or '1.3335 BTC'.
 */
export default function Amount({
  n,
  type,
  decimals,
}: {
  n: number | BigNumber;
  type: "wei" | "sats" | "eth" | "btc";
  decimals?: number | "all";
}) {
  const { symbol, amountStr } = formatAmount(n, type, decimals);

  return (
    <span>
      <span className="component-amount-n">{amountStr}</span> {symbol}
    </span>
  );
}

export function formatAmount(
  n: number | BigNumber,
  type: "wei" | "sats" | "eth" | "btc",
  decimals?: number | "all"
): { symbol: string; amountStr: string } {
  // First, normalize to (number) (eth | btc)
  if (typeof n !== "number") {
    n = toFloat64(n);
  }
  switch (type) {
    case "wei":
      n *= 1e-18;
      type = "eth";
      break;
    case "sats":
      n *= 1e-8;
      type = "btc";
      break;
    default:
      break;
  }

  // Then, format eg. '12.351 ETH' or '1.3335 BTC'
  switch (type) {
    case "eth":
      if (decimals === "all") decimals = 18;
      else if (decimals == null) decimals = 3;
      break;
    case "btc":
      if (decimals === "all") decimals = 8;
      else if (decimals == null) decimals = 4;
      break;
    default:
      throw new Error(`invalid type ${type}`);
  }
  const symbol = type.toUpperCase();
  const amountStr = n.toFixed(decimals);

  return { symbol, amountStr };
}
