import { Escrow } from "../../model/Escrow";
import { Order } from "../../model/Orderbook";

export type ModalInfo =
  | { type: "none" }
  | { type: "please-connect" }
  | { type: "bid" }
  | { type: "ask" }
  | { type: "buy"; order: Order }
  | { type: "sell"; order: Order }
  | { type: "cancel"; order: Order }
  | { type: "slash"; escrow: Escrow }
  | { type: "prove"; escrow: Escrow };

export type DispatchFn = (a: ModalInfo) => void;
