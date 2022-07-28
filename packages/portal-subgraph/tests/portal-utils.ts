import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  EscrowSettled,
  EscrowSlashed,
  OrderCancelled,
  OrderMatched,
  OrderPlaced,
  OwnerUpdated,
  ParamUpdated
} from "../generated/Portal/Portal"

export function createEscrowSettledEvent(
  escrowID: BigInt,
  amountSats: BigInt,
  ethDest: Address,
  ethAmount: BigInt
): EscrowSettled {
  let escrowSettledEvent = changetype<EscrowSettled>(newMockEvent())

  escrowSettledEvent.parameters = new Array()

  escrowSettledEvent.parameters.push(
    new ethereum.EventParam(
      "escrowID",
      ethereum.Value.fromUnsignedBigInt(escrowID)
    )
  )
  escrowSettledEvent.parameters.push(
    new ethereum.EventParam(
      "amountSats",
      ethereum.Value.fromUnsignedBigInt(amountSats)
    )
  )
  escrowSettledEvent.parameters.push(
    new ethereum.EventParam("ethDest", ethereum.Value.fromAddress(ethDest))
  )
  escrowSettledEvent.parameters.push(
    new ethereum.EventParam(
      "ethAmount",
      ethereum.Value.fromUnsignedBigInt(ethAmount)
    )
  )

  return escrowSettledEvent
}

export function createEscrowSlashedEvent(
  escrowID: BigInt,
  escrowDeadline: BigInt,
  ethDest: Address,
  ethAmount: BigInt
): EscrowSlashed {
  let escrowSlashedEvent = changetype<EscrowSlashed>(newMockEvent())

  escrowSlashedEvent.parameters = new Array()

  escrowSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "escrowID",
      ethereum.Value.fromUnsignedBigInt(escrowID)
    )
  )
  escrowSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "escrowDeadline",
      ethereum.Value.fromUnsignedBigInt(escrowDeadline)
    )
  )
  escrowSlashedEvent.parameters.push(
    new ethereum.EventParam("ethDest", ethereum.Value.fromAddress(ethDest))
  )
  escrowSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "ethAmount",
      ethereum.Value.fromUnsignedBigInt(ethAmount)
    )
  )

  return escrowSlashedEvent
}

export function createOrderCancelledEvent(orderID: BigInt): OrderCancelled {
  let orderCancelledEvent = changetype<OrderCancelled>(newMockEvent())

  orderCancelledEvent.parameters = new Array()

  orderCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "orderID",
      ethereum.Value.fromUnsignedBigInt(orderID)
    )
  )

  return orderCancelledEvent
}

export function createOrderMatchedEvent(
  escrowID: BigInt,
  orderID: BigInt,
  amountSats: BigInt,
  priceTokPerSat: BigInt,
  takerStakedTok: BigInt,
  maker: Address,
  taker: Address
): OrderMatched {
  let orderMatchedEvent = changetype<OrderMatched>(newMockEvent())

  orderMatchedEvent.parameters = new Array()

  orderMatchedEvent.parameters.push(
    new ethereum.EventParam(
      "escrowID",
      ethereum.Value.fromUnsignedBigInt(escrowID)
    )
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam(
      "orderID",
      ethereum.Value.fromUnsignedBigInt(orderID)
    )
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam(
      "amountSats",
      ethereum.Value.fromSignedBigInt(amountSats)
    )
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam(
      "priceTokPerSat",
      ethereum.Value.fromUnsignedBigInt(priceTokPerSat)
    )
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam(
      "takerStakedTok",
      ethereum.Value.fromUnsignedBigInt(takerStakedTok)
    )
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )
  orderMatchedEvent.parameters.push(
    new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker))
  )

  return orderMatchedEvent
}

export function createOrderPlacedEvent(
  orderID: BigInt,
  amountSats: BigInt,
  priceTokPerSat: BigInt,
  makerStakedTok: BigInt,
  maker: Address
): OrderPlaced {
  let orderPlacedEvent = changetype<OrderPlaced>(newMockEvent())

  orderPlacedEvent.parameters = new Array()

  orderPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "orderID",
      ethereum.Value.fromUnsignedBigInt(orderID)
    )
  )
  orderPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "amountSats",
      ethereum.Value.fromSignedBigInt(amountSats)
    )
  )
  orderPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "priceTokPerSat",
      ethereum.Value.fromUnsignedBigInt(priceTokPerSat)
    )
  )
  orderPlacedEvent.parameters.push(
    new ethereum.EventParam(
      "makerStakedTok",
      ethereum.Value.fromUnsignedBigInt(makerStakedTok)
    )
  )
  orderPlacedEvent.parameters.push(
    new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker))
  )

  return orderPlacedEvent
}

export function createOwnerUpdatedEvent(
  user: Address,
  newOwner: Address
): OwnerUpdated {
  let ownerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent())

  ownerUpdatedEvent.parameters = new Array()

  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownerUpdatedEvent
}

export function createParamUpdatedEvent(
  oldVal: BigInt,
  newVal: BigInt,
  name: string
): ParamUpdated {
  let paramUpdatedEvent = changetype<ParamUpdated>(newMockEvent())

  paramUpdatedEvent.parameters = new Array()

  paramUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldVal", ethereum.Value.fromUnsignedBigInt(oldVal))
  )
  paramUpdatedEvent.parameters.push(
    new ethereum.EventParam("newVal", ethereum.Value.fromUnsignedBigInt(newVal))
  )
  paramUpdatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return paramUpdatedEvent
}
