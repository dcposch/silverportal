import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  Portal,
  EscrowSettled,
  EscrowSlashed,
  OrderCancelled,
  OrderMatched,
  OrderPlaced,
  OwnerUpdated,
  ParamUpdated
} from "../generated/Portal/Portal"
import { Escrow, Order } from "../generated/schema"
import { ESCROW_STATUS_PENDING, ESCROW_STATUS_SETTLED, ESCROW_STATUS_SLASHED, ORDER_STATUS_PENDING, ORDER_STATUS_FILLED, ORDER_STATUS_CANCELLED } from "./utils/constants";

export function handleEscrowSettled(event: EscrowSettled): void {
  let escrowID = event.params.escrowID.toString();
  let escrow = Escrow.load(escrowID);

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!escrow) {
    log.error('[handleEscrowSettled] Escrow #{} not found. Hash {}', [
      escrowID,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  escrow.status = ESCROW_STATUS_SETTLED;

  // Entities can be written to the store with `.save()`
  escrow.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.btcVerifier(...)
  // - contract.escrows(...)
  // - contract.minConfirmations(...)
  // - contract.nextOrderID(...)
  // - contract.orderbook(...)
  // - contract.owner(...)
  // - contract.stakePercent(...)
  // - contract.token(...)
}

export function handleEscrowSlashed(event: EscrowSlashed): void {
  let escrowID = event.params.escrowID.toString();
  let escrow = Escrow.load(escrowID);

  if (!escrow) {
    log.error('[handleEscrowSettled] Escrow #{} not found. Hash {}', [
      escrowID,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  escrow.status = ESCROW_STATUS_SLASHED;

  escrow.save()
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let orderID = event.params.orderID.toString();
  let order = Order.load(orderID);

  if (!order) {
    log.error('[handleOrderCancelled] Order #{} not found. Hash {}', [
      orderID,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  order.status = ORDER_STATUS_CANCELLED;

  order.save()
}

export function handleOrderMatched(event: OrderMatched): void {
  let orderID = event.params.orderID.toString();
  let order = Order.load(orderID);

  if (!order) {
    log.error('[handleOrderMatched] Order #{} not found. Hash {}', [
      orderID,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let orderSats = event.params.amountSatsFilled;
  if (order.amountSats.equals(orderSats)) {
    order.status = ORDER_STATUS_FILLED;
  }
  order.amountSats -= orderSats;
  order.save()

  let escrow = new Escrow(event.params.escrowID.toString());
  escrow.order = orderID;
  escrow.amountSatsDue = event.params.amountSatsFilled;
  escrow.deadline = event.params.deadline;
  escrow.successRecipient = event.params.maker.toHexString();
  escrow.timeoutRecipient = event.params.taker.toHexString();
  escrow.status = ESCROW_STATUS_PENDING;
  escrow.escrowTok = event.params.takerStakedTok;
  escrow.save();
}

export function handleOrderPlaced(event: OrderPlaced): void {
  let orderID = event.params.orderID.toString();
  let order = new Order(orderID);
  order.maker = event.params.maker.toHexString();
  order.amountSats = event.params.amountSats;
  order.priceTokPerSat = event.params.priceTokPerSat;
  order.stakedTok = event.params.makerStakedTok;
  order.status = ORDER_STATUS_PENDING;
  order.save()
}

export function handleOwnerUpdated(event: OwnerUpdated): void {}

export function handleParamUpdated(event: ParamUpdated): void {}
