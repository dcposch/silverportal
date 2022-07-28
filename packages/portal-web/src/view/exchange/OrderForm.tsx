import { BigNumber } from "ethers";
import * as React from "react";
import { useCallback } from "react";
import { Order, Orderbook } from "../../model/Orderbook";

interface OrderFormProps {
  orders: Orderbook;
}

export default class OrderForm extends React.PureComponent<OrderFormProps> {
  state = {
    tokFrom: "BTC",
    tokTo: "WBTC",
    amountSats: 0,
    amountTok: 0,
    limitPriceTokPerSat: 0,
    error: "",
  };

  render() {
    console.log("Rendering OrderForm");
    const { tokFrom, tokTo, amountTok, amountSats, limitPriceTokPerSat } =
      this.state;

    const isLimit = limitPriceTokPerSat > 0;
    const limitPriceStr = ((limitPriceTokPerSat * 1e8) / 1e18).toFixed(5);
    const marketPriceStr = ((amountTok / 1e18 / amountSats) * 1e8).toFixed(5);
    const showPrice = isLimit || (amountTok > 0 && amountSats > 0);

    const isBuy = tokTo === "BTC";
    if ((tokFrom === "BTC") === (tokTo === "BTC")) throw new Error("invalid");
    const tokStr = tokFrom === "BTC" ? tokTo : tokFrom;
    const amountTokStr = (amountTok / 1e18).toFixed(5);
    const amountBtcStr = (amountSats / 1e8).toLocaleString([], {
      maximumFractionDigits: 8,
    });

    const inBtc = (
      <input
        key={tokFrom}
        type="number"
        defaultValue={amountBtcStr}
        step="0.01"
        onFocus={this.selectAmountBtc}
        onChange={this.setAmountBtc}
      />
    );
    const inTok = <input disabled value={amountTokStr} />;

    return (
      <div className="exchange-of">
        <div className="exchange-of-row">
          {tokFrom === "BTC" ? inBtc : inTok}
          <TokSelect sel={tokFrom} onChange={this.setTokFrom} />
        </div>
        <div className="exchange-of-trade-arrow">
          <span>⬇️</span>
        </div>
        <div className="exchange-of-row">
          {tokTo === "BTC" ? inBtc : inTok}
          <TokSelect sel={tokTo} onChange={this.setTokTo} />
        </div>
        <div className="exchange-of-row exchange-of-baseline exchange-limit">
          <input type="checkbox" checked={isLimit} onChange={this.setIsLimit} />
          <label>
            Limit &nbsp; &nbsp;{" "}
            {showPrice && (isLimit ? "limit price" : "market price")}
          </label>
          {isLimit && (
            <input
              className="exchange-of-limit-price"
              defaultValue={limitPriceStr}
              onChange={this.setLimitPrice}
            />
          )}
          {!isLimit && showPrice && (
            <div className="exchange-of-limit-price">{marketPriceStr}</div>
          )}
          {showPrice && (
            <label className="exchange-of-sublabel">{tokStr}</label>
          )}
        </div>
        <div className="exchange-of-row exchange-of-baseline">
          <button disabled={amountSats === 0 || this.state.error != ""}>
            {isLimit && isBuy && "Place bid"}
            {isLimit && !isBuy && "Place ask"}
            {!isLimit && isBuy && "Buy BTC"}
            {!isLimit && !isBuy && "Sell BTC"}
          </button>
          <span className="exchange-of-error">{this.state.error}</span>
        </div>
      </div>
    );
  }

  setIsLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const limitTokPerSat = checked ? this.getMidMarketOr1() : 0;
    this.calcPrice(undefined, limitTokPerSat);
  };

  setLimitPrice(e: React.ChangeEvent<HTMLInputElement>) {
    const tokPerBtc = parseFloat(e.target.value);
    const limitTokPerSat = Math.round(tokPerBtc * 1e8);
    if (!(limitTokPerSat > 0)) return; // TODO
    this.calcPrice(undefined, limitTokPerSat);
  }

  /** Gets the mid-market price, in tokens per satoshi, or 1. Always >0. */
  getMidMarketOr1() {
    const { orders } = this.props;
    if (orders == null) return 1;
    const bbo = orders.getBestBidAsk();
    if (bbo[0] == null) return bbo[1] || 1;
    else if (bbo[1] == null) return bbo[0];
    else return Math.round((bbo[0] + bbo[1]) / 2);
  }

  selectAmountBtc = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  setAmountBtc = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (!/^[0-9]*\.?[0-9]*$/.test(v)) {
      console.log(`Stopping '${v}'`);
      v = e.target.value = "0.0";
      e.target.select();
    }

    const amountSats = Math.round(Number.parseFloat(v || "0") * 1e8);
    console.log(`setAmountBtc sats ${amountSats}`);
    this.calcPrice(amountSats, undefined);
  };

  calcPrice = (amountSats?: number, limitPriceTokPerSat?: number) => {
    const { orders } = this.props;
    const { tokTo } = this.state;

    if (amountSats == null) amountSats = this.state.amountSats;
    if (limitPriceTokPerSat == null) {
      limitPriceTokPerSat = this.state.limitPriceTokPerSat;
    }

    const isLimit = limitPriceTokPerSat > 0;
    const isBuy = tokTo === "BTC";
    console.log(
      `calcPrice limit ${isLimit} buy ${isBuy} btc ${amountSats / 1e8}`
    );

    let amountTok = 0;
    let error = "";
    if (orders == null) {
      error = "Failed to load orderbook, offline?";
    } else if (isLimit) {
      const bbo = orders.getBestBidAsk();
      console.log(`Limit order @ ${limitPriceTokPerSat}, bbo ${bbo.join("/")}`);
      if (isBuy && bbo[1] && limitPriceTokPerSat >= bbo[1]) {
        error = "Bid too high, crosses the market";
      } else if (!isBuy && bbo[0] && limitPriceTokPerSat <= bbo[0]) {
        error = "Ask too low, crosses the market";
      } else {
        amountTok = limitPriceTokPerSat * amountSats;
      }
    } else {
      const liquidityOrders = isBuy ? orders.asks : orders.bids;
      console.log(
        `Market ${isBuy ? "buy" : "sell"} ${amountSats}sat`,
        liquidityOrders
      );
      const orderToFill = getFirstBigEnoughOrder(amountSats, liquidityOrders);
      if (orderToFill == null) {
        error = "Not enough liquidity, try limit order";
      } else {
        amountTok = orderToFill.priceTokPerSat.toNumber() * amountSats;
      }
    }

    this.setState({ amountSats, amountTok, limitPriceTokPerSat, error });
  };

  setTokFrom = (tokFrom: string) => {
    let { tokTo } = this.state;
    const nonBtc = tokTo === "BTC" ? "WBTC" : tokTo;
    tokTo = tokFrom === "BTC" ? nonBtc : "BTC";
    this.setState({ tokFrom, tokTo }, this.calcPrice);
  };

  setTokTo = (tokTo: string) => {
    let { tokFrom } = this.state;
    const nonBtc = tokFrom === "BTC" ? "WBTC" : tokFrom;
    tokFrom = tokTo === "BTC" ? "WBTC" : "BTC";
    this.setState({ tokFrom, tokTo }, this.calcPrice);
  };
}

function getFirstBigEnoughOrder(amountSats: number, orders: Order[]) {
  const bnSats = BigNumber.from(amountSats);
  return orders.find((o: Order) => o.amountSats.abs().gte(bnSats));
}

const tokens = ["BTC", "WBTC", "ETH"];
function TokSelect({
  sel,
  onChange,
}: {
  sel: string;
  onChange: (val: string) => void;
}) {
  const onC = useCallback(
    (v: React.ChangeEvent<HTMLSelectElement>) =>
      onChange(tokens[v.target.selectedIndex]),
    [onChange]
  );
  return (
    <select onChange={onC} value={sel}>
      {tokens.map((t) => (
        <option key={t}>{t}</option>
      ))}
    </select>
  );
}
