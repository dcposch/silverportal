import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { Order, Escrow } from "../generated/schema"
import { EscrowSettled } from "../generated/Portal/Portal"
import { handleOrderPlaced, handleOrderMatched, handleEscrowSettled } from "../src/portal"
import { createOrderPlacedEvent, createOrderMatchedEvent, createEscrowSettledEvent } from "./portal-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orderID = BigInt.fromI32(111)
    let amountSats = BigInt.fromI32(222)
    let ethDest = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let pricePerTok = BigInt.fromI32(333);
    let stakedTok = BigInt.fromI32(444);
    let newOrderPlacedEvent = createOrderPlacedEvent(
      orderID,
      amountSats,
      pricePerTok,
      stakedTok,
      ethDest
    )
    handleOrderPlaced(newOrderPlacedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Order created and stored", () => {
    assert.entityCount("Order", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Order",
      "111",
      "amountSats",
      "222"
    )
    assert.fieldEquals(
      "Order",
      "111",
      "maker",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Order",
      "111",
      "priceTokPerSat",
      "333"
    )
    assert.fieldEquals(
      "Order",
      "111",
      "stakedTok",
      "444"
    )
    assert.fieldEquals(
      "Order",
      "111",
      "status",
      "PENDING"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
  
  test("OrderPlaced and EscrowCreated", () => {
    let escrowID = BigInt.fromI32(11)
    let orderID = BigInt.fromI32(111)
    let amountSats = BigInt.fromI32(222)
    let amountSatsFilled = BigInt.fromI32(111)
    let maker = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let taker = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    )
    let deadline = BigInt.fromI32(123123123);
    let pricePerTok = BigInt.fromI32(333);
    let stakedTok = BigInt.fromI32(444);
    let newOrderMatchedEvent = createOrderMatchedEvent(
      escrowID,
      orderID,
      amountSats,
      amountSatsFilled,
      pricePerTok,
      stakedTok,
      deadline,
      maker,
      taker,
    )

    handleOrderMatched(newOrderMatchedEvent)
    assert.entityCount("Order", 1)
    assert.entityCount("Escrow", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Order",
      "111",
      "amountSats",
      "111"
    )
    assert.fieldEquals(
      "Order",
      "111",
      "status",
      "PENDING"
    )

    assert.fieldEquals(
      "Escrow",
      "11",
      "amountSatsDue",
      "111"
    )
    assert.fieldEquals(
      "Escrow",
      "11",
      "order",
      "111"
    )
    assert.fieldEquals(
      "Escrow",
      "11",
      "deadline",
      "123123123"
    )
    assert.fieldEquals(
      "Escrow",
      "11",
      "successRecipient",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Escrow",
      "11",
      "timeoutRecipient",
      "0x0000000000000000000000000000000000000002"
    )
    assert.fieldEquals(
      "Escrow",
      "11",
      "status",
      "PENDING"
    )
    
    let newOrderMatchedEvent2 = createOrderMatchedEvent(
      BigInt.FromI32(12),
      orderID,
      amountSats,
      amountSatsFilled,
      pricePerTok,
      stakedTok,
      deadline,
      maker,
      taker,
    )

    handleOrderMatched(newOrderMatchedEvent2)

    assert.fieldEquals(
      "Escrow",
      "12",
      "amountSatsDue",
      "111"
    )
    assert.fieldEquals(
      "Escrow",
      "12",
      "order",
      "111"
    )
    assert.fieldEquals(
      "Escrow",
      "12",
      "deadline",
      "123123123"
    )
    assert.fieldEquals(
      "Escrow",
      "12",
      "successRecipient",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Escrow",
      "12",
      "timeoutRecipient",
      "0x0000000000000000000000000000000000000002"
    )
    assert.fieldEquals(
      "Escrow",
      "12",
      "status",
      "FILLED"
    )
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
