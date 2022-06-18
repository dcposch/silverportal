import * as React from "react";
import { Order, Orderbook } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import ViewContractLink from "../components/ViewContractLink";
import { DispatchFn, ModalInfo } from "./exchangeActions";

export default function OrdersTable({
  orders,
  params,
  dispatch,
}: {
  orders: Orderbook;
  params: PortalParams;
  dispatch: DispatchFn;
}) {
  if (orders == null || params == null) return null;
  return (
    <div>
      <h2>
        Orderbook{" "}
        <small>
          <ViewContractLink
            network={params.ethNetwork}
            contract={params.contractAddr}
          />
        </small>
      </h2>
      <div className="exchange-two-col">
        <div>
          {orders.bids.map((o) => (
            <OrderRow key={o.orderID} o={o} dispatch={dispatch} />
          ))}
        </div>
        <div>
          {orders.asks.map((o) => (
            <OrderRow key={o.orderID} o={o} dispatch={dispatch} />
          ))}
        </div>
      </div>
      <div className="exchange-two-col">
        <div className="exchange-row">
          <button
            onClick={React.useCallback(() => dispatch({ type: "bid" }), [])}
          >
            Post Bid
          </button>
        </div>
        <div className="exchange-row">
          <button
            onClick={React.useCallback(() => dispatch({ type: "ask" }), [])}
          >
            Post Ask
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ o, dispatch }: { o: Order; dispatch: DispatchFn }) {
  const amountSats = o.amountSats.toNumber();
  const priceWeiPerSat = o.priceWeiPerSat.toNumber();

  const type = amountSats < 0 ? "ASK" : "BID";
  const amount = Math.abs(amountSats / 1e8).toFixed(8);
  const price = (1e18 / (priceWeiPerSat * 1e8)).toFixed(5);

  let orderAction: ModalInfo, orderLabel: string;
  if (type === "ASK") {
    orderAction = { type: "buy", order: o };
    orderLabel = "Buy";
  } else {
    orderAction = { type: "sell", order: o };
    orderLabel = "Sell";
  }
  const orderCb = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(orderAction);
  }, []);

  return (
    <div className="exchange-order-row">
      <strong>{type}</strong>
      <span>{price}</span>
      <span>{amount}</span>
      <a href="#" onClick={orderCb}>
        {orderLabel}
      </a>
    </div>
  );
}
