import * as React from "react";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { Order, Orderbook } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import { toFloat64 } from "../../utils/math";
import { DispatchFn, ModalInfo } from "./exchangeActions";

const TOP_N = 6; // Display only the best bids and asks

export default function OrdersTable({
  orders,
  params,
  dispatch,
}: {
  orders: Orderbook;
  params: PortalParams;
  dispatch: DispatchFn;
}) {
  const connectedAccount = useAccount().address;

  if (orders == null || params == null) return null;

  const props = { dispatch, connectedAccount };

  return (
    <div>
      <div className="exchange-two-col">
        <div className="exchange-bids">
          {orders.bids.length === 0 && <h3>NO BIDS</h3>}
          {orders.bids.map((o, i) => (
            <OrderRow key={o.orderID} o={o} nthBest={i} {...props} />
          ))}
        </div>
        <div className="exchange-asks">
          {orders.asks.length === 0 && <h3>NO ASKS</h3>}
          {orders.asks.map((o, i) => (
            <OrderRow key={o.orderID} o={o} nthBest={i} {...props} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderRow({
  o,
  nthBest,
  dispatch,
  connectedAccount,
}: {
  o: Order;
  nthBest: number;
  dispatch: DispatchFn;
  connectedAccount: string;
}) {
  // Only display the best N bids and asks. Always display our own.
  const isOurs = o.maker === connectedAccount;
  if (!isOurs && nthBest >= TOP_N) return null;

  const amountSats = toFloat64(o.amountSats);
  const priceTokPerSat = toFloat64(o.priceTokPerSat);
  const type = amountSats < 0 ? "ASK" : "BID";
  const amountBtc = Math.abs(amountSats / 1e8).toFixed(5);
  const priceBtcPerEth = (1e10 / priceTokPerSat).toFixed(5);

  let orderAction: ModalInfo, orderLabel: string;
  if (isOurs) {
    orderAction = { type: "cancel", order: o };
    orderLabel = "Del";
  } else if (type === "ASK") {
    orderAction = { type: "buy", order: o };
    orderLabel = "Buy";
  } else {
    orderAction = { type: "sell", order: o };
    orderLabel = "Sell";
  }
  const orderCb = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(orderAction);
  }, []);

  const isBest = nthBest === 0;
  const dispType = isBest ? `BEST\n${type}` : type;
  const labelPrice = isBest && <label>Price</label>;
  const labelAmount = isBest && <label>Amount</label>;
  return (
    <div
      className={`exchange-order-row${isBest ? " exchange-best-order" : ""}`}
    >
      <div className="exchange-order-type">{dispType}</div>
      <div className="exchange-order-price">
        {labelPrice}
        {priceBtcPerEth}
      </div>
      <div className="exchange-order-amount">
        {labelAmount}
        {amountBtc}
      </div>
      <div className="exchange-order-action">
        {isBest && <button onClick={orderCb}>{orderLabel}</button>}
        {!isBest && (
          <a href="#" onClick={orderCb}>
            {orderLabel}
          </a>
        )}
      </div>
    </div>
  );
}
