import { ethers } from "ethers";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import { factories, Portal } from "../../types/ethers-contracts";

type OrderT = [
  string,
  ethers.BigNumber,
  ethers.BigNumber,
  string,
  ethers.BigNumber
];

const contract = "0x326122a2d043e9c1af83841e53a15175ca75709b";

type ModalType = "bid" | "ask" | "buy" | "sell" | "slash" | "prove";

export default function ExchangeOrderbook() {
  const provider = useProvider();
  const { data: signer } = useSigner();

  const portal = useMemo(() => {
    console.log("Contract " + (signer ? "ready to transact" : "read-only"));
    return factories.Portal__factory.connect(contract, signer || provider);
  }, [signer, provider]);

  const [params, setParams] = useState<PortalParams | null>(null);
  useEffect(() => {
    loadParams(portal).then(setParams).catch(console.error);
  }, []);

  const [orders, setOrders] = useState<OrderT[]>([]);
  useEffect(() => {
    loadOrderbook(portal).then(setOrders).catch(console.error);
  }, []);

  return (
    <div>
      <OrdersTable orders={orders} />
      <PlaceBidForm
        portal={portal}
        stakePercent={params && params.stakePercent}
      />
    </div>
  );
}

function OrdersTable({ orders }: { orders: OrderT[] }) {
  const orderbook = orders.map((o, i) => {
    const amountSats = o[1].toNumber();
    const priceWeiPerSat = o[2].toNumber();

    const type = amountSats < 0 ? "ASK" : " BID";
    const amount = Math.abs(amountSats / 1e8).toFixed(8);
    const price = ((priceWeiPerSat * 1e8) / 1e18).toFixed(4);
    return (
      <div key={i}>
        <strong>{type}</strong> {price} for {amount} BTC
      </div>
    );
  });

  return <div>{orderbook}</div>;
}

interface PortalParams {
  stakePercent: number;
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

function PlaceBidForm({
  portal,
  stakePercent,
}: {
  portal: Portal;
  stakePercent?: number;
}) {
  const refBidAmount = useRef<HTMLInputElement>();
  const refBidPrice = useRef<HTMLInputElement>();

  const placeBid = useCallback(() => {
    const amountSats = Number(refBidAmount.current.value) * 1e8;
    const priceWeiPerSat = Number(refBidPrice.current.value) * 1e10;
    if (!(amountSats > 0) || !(priceWeiPerSat > 0)) {
      return; // Ignore invalid or non-numerical inputs
    }

    if (stakePercent == null || !(stakePercent > 0)) {
      throw new Error("Missing stake percentage");
    }

    const totalWei = amountSats * priceWeiPerSat;
    const stakeWei = (totalWei * stakePercent) / 100;
    console.log(
      "Place bid " +
        JSON.stringify({ amountSats, priceWeiPerSat, stakeWei, stakePercent })
    );

    portal.postBid(amountSats, priceWeiPerSat, {
      value: stakeWei,
    });
  }, [portal, stakePercent]);

  return (
    <div>
      <h2>
        Place bid{" "}
        {stakePercent != null && <small>requires {stakePercent}% stake</small>}
      </h2>
      <label>Amount of BTC you're selling.</label>
      <input ref={refBidAmount} defaultValue={0.01}></input>
      <label>Price you will pay, in ETH per BTC.</label>
      <input ref={refBidPrice} defaultValue={18}></input>
      <button onClick={placeBid}>Place bid</button>
    </div>
  );
}

function PlaceAskForm({ portal }: { portal: Portal }) {
  return (
    <div>
      <h2>Place ask</h2>
      <label>Amount of BTC you're buying.</label>
      <input></input>
      <label>Price you will pay, in ETH per BTC.</label>
      <input></input>
      <button onClick={null}>Place ask</button>
    </div>
  );
}
