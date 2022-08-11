import { BigNumber } from "ethers";

export function toFloat64(bn: BigNumber | number) {
  if (typeof bn === "number") {
    return bn;
  }
  // BigNumber.toNumber() throws for numbers outside the safe int range.
  return Number(bn.toString());
}
