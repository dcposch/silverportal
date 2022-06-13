import { ethers } from "ethers";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { factories, Portal } from "../../types/ethers-contracts";
import PortalParams from "../utils/PortalParams";
import {
  AskModal,
  BidModal,
  BuyModal,
  ProveModal,
  SellModal,
  SlashModal,
} from "./ExchangeModals";

type OrderT = [
  string,
  ethers.BigNumber,
  ethers.BigNumber,
  string,
  ethers.BigNumber
];

const contract = "0x326122a2d043e9c1af83841e53a15175ca75709b";

type ModalInfo =
  | { type: "none" }
  | { type: "bid" }
  | { type: "ask" }
  | { type: "buy"; orderID: number }
  | { type: "sell"; orderID: number }
  | { type: "slash"; escrowID: number }
  | { type: "prove"; escrowID: number };

export default function Exchange() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  const portal = useMemo(() => {
    console.log("Contract " + (signer ? "ready to transact" : "read-only"));
    return factories.Portal__factory.connect(contract, signer || provider);
  }, [signer, provider]);

  // Parameters change slowly, if ever. Load on page load only.
  const [params, setParams] = useState<PortalParams | null>(null);
  useEffect(() => {
    console.log("Loading Portal parameters...");
    loadParams(portal).then(setParams).catch(console.error);
  }, []);

  // Orders are dynamic. Load every few seconds + immediately after each action.
  const [orders, setOrders] = useState<OrderT[]>([]);
  useEffect(() => {
    console.log("Loading orderbook...");
    loadOrderbook(portal).then(setOrders).catch(console.error);
  }, [(new Date().getUTCSeconds() | 0) / 10]);

  const [modal, setModal] = useState<ModalInfo>({ type: "none" });

  const onClose = useCallback(() => setModal({ type: "none" }), []);
  const props = { portal, params, onClose };

  return (
    <div>
      <OrdersTable orders={orders} setModal={setModal} />
      {modal.type === "bid" && <BidModal {...props} />}
      {modal.type === "ask" && <AskModal {...props} />}
      {modal.type === "buy" && <BuyModal {...props} orderID={modal.orderID} />}
      {modal.type === "sell" && (
        <SellModal {...props} orderID={modal.orderID} />
      )}
      {modal.type === "prove" && (
        <ProveModal {...props} escrowID={modal.escrowID} />
      )}
      {modal.type === "slash" && (
        <SlashModal {...props} escrowID={modal.escrowID} />
      )}
    </div>
  );
}

function OrdersTable({
  orders,
  setModal,
}: {
  orders: OrderT[];
  setModal: (m: ModalInfo) => void;
}) {
  const orderbook = orders.map((o, i) => {
    const amountSats = o[1].toNumber();
    const priceWeiPerSat = o[2].toNumber();

    const type = amountSats < 0 ? "ASK" : "BID";
    const amount = Math.abs(amountSats / 1e8).toFixed(8);
    const price = ((priceWeiPerSat * 1e8) / 1e18).toFixed(4);

    const orderID = i + 1; // TODO: add to OrderT

    return (
      <div key={i}>
        <strong>{type}</strong> {price} for {amount} BTC.
        {type === "ASK" && (
          <button onClick={() => setModal({ type: "buy", orderID })}>
            Buy
          </button>
        )}
        {type === "BID" && (
          <button onClick={() => setModal({ type: "sell", orderID })}>
            Sell
          </button>
        )}
      </div>
    );
  });

  return (
    <div>
      {orderbook}
      <button onClick={useCallback(() => setModal({ type: "bid" }), [])}>
        Post Bid
      </button>
      <button onClick={useCallback(() => setModal({ type: "ask" }), [])}>
        Post Ask
      </button>
    </div>
  );
}

async function loadParams(portal: Portal) {
  const stakePercent = (await portal.stakePercent()).toNumber();
  return { stakePercent };
}

async function loadOrderbook(portal: Portal) {
  const n = (await portal.nextOrderID()).toNumber();

  const promises = [] as Promise<OrderT>[];
  for (let i = 1; i < n; i++) {
    promises.push(portal.orderbook(i));
  }
  const orders = await Promise.all(promises);
  return orders;
}
