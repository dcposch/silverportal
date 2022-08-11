import { ethers } from "ethers";

/** Represents one bid or ask. */
export interface Order {
  orderID: number;
  maker: string;
  amountSats: ethers.BigNumber;
  priceTps: ethers.BigNumber;
  scriptHash: string;
  stakedTok: ethers.BigNumber;
}

/** Represents a limit orderbook of sorted bids and asks. */
export class Orderbook {
  /** Best first, descending price, positive amounts. */
  bids: Order[];
  /** Best first, ascending price, negative amounts */
  asks: Order[];

  constructor(orders: Order[]) {
    // Split bids and asks, sort by price
    const byPrice = (a: Order, b: Order, c: number) =>
      (a.priceTps.toNumber() - b.priceTps.toNumber()) * c;
    this.bids = orders
      .filter((o) => o.amountSats.isNegative())
      .sort((a, b) => byPrice(a, b, -1));
    this.asks = orders
      .filter((o) => !o.amountSats.isNegative())
      .sort((a, b) => byPrice(a, b, 1));
  }

  /**
   * Returns the highest bid (or null, if there are no bids) and lowest ask.
   * Prices in wei per sat = ETH per BTC * 10^10.
   */
  getBestBidAsk(): number[] {
    const o = this;
    return [
      o.bids[0] ? o.bids[0].priceTps.toNumber() : undefined,
      o.asks[0] ? o.asks[0].priceTps.toNumber() : undefined,
    ];
  }
}
