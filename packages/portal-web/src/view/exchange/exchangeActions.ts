import { Escrow } from "../../model/Escrow";
import { Order } from "../../model/Orderbook";

export type ModalInfo =
  | { type: "none" }
  | { type: "please-connect" }
  | { type: "bid"; amountSats: number; tokPerSat: number }
  | { type: "ask"; amountSats: number; tokPerSat: number }
  | { type: "buy"; order: Order; amountSats: number }
  | { type: "sell"; order: Order; amountSats: number }
  | { type: "cancel"; order: Order }
  | { type: "slash"; escrow: Escrow }
  | { type: "prove"; escrow: Escrow };

export type DispatchFn = (a: ModalInfo) => void;
