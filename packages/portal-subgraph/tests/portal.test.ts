import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { Order, Escrow } from "../generated/schema";
import { EscrowSettled } from "../generated/Portal/Portal";
import {
  handleOrderPlaced,
  handleOrderMatched,
  handleOrderCancelled,
  handleEscrowSettled,
  handleEscrowSlashed,
} from "../src/portal";
import {
  createOrderPlacedEvent,
  createOrderMatchedEvent,
  createOrderCancelledEvent,
  createEscrowSettledEvent,
  createEscrowSlashedEvent,
} from "./portal-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let orderID = BigInt.fromI32(111);
    let amountSats = BigInt.fromI32(222);
    let ethDest = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let pricePerTok = BigInt.fromI32(333);
    let stakedTok = BigInt.fromI32(444);
    let newOrderPlacedEvent = createOrderPlacedEvent(
      orderID,
      amountSats,
      pricePerTok,
      stakedTok,
      ethDest
    );
    handleOrderPlaced(newOrderPlacedEvent);

    // Create a partial order
    let escrowID = BigInt.fromI32(11);
    let amountSatsFilled = BigInt.fromI32(111);
    let maker = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let taker = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    let deadline = BigInt.fromI32(123123123);
    let destScriptHash = Bytes.fromI32(123123333);
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
      destScriptHash
    );

    handleOrderMatched(newOrderMatchedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("Order and partial escrow", () => {
    assert.entityCount("Order", 1);
    assert.entityCount("Escrow", 1);

    assert.fieldEquals("Order", "111", "amountSats", "111");
    assert.fieldEquals(
      "Order",
      "111",
      "maker",
      "0x0000000000000000000000000000000000000001"
    );
    assert.fieldEquals("Order", "111", "priceTps", "333");
    assert.fieldEquals("Order", "111", "stakedTok", "444");
    assert.fieldEquals("Order", "111", "status", "PENDING");

    assert.fieldEquals("Escrow", "11", "amountSatsDue", "111");
    assert.fieldEquals("Escrow", "11", "order", "111");
    assert.fieldEquals("Escrow", "11", "deadline", "123123123");
    assert.fieldEquals(
      "Escrow",
      "11",
      "successRecipient",
      "0x0000000000000000000000000000000000000001"
    );
    assert.fieldEquals(
      "Escrow",
      "11",
      "timeoutRecipient",
      "0x0000000000000000000000000000000000000002"
    );
    assert.fieldEquals("Escrow", "11", "status", "PENDING");
  });

  test("OrderPlaced and EscrowCreated", () => {
    let escrowID = BigInt.fromI32(11);
    let orderID = BigInt.fromI32(111);
    let amountSats = BigInt.fromI32(222);
    let amountSatsFilled = BigInt.fromI32(111);
    let maker = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let taker = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    let deadline = BigInt.fromI32(123123123);
    let pricePerTok = BigInt.fromI32(333);
    let stakedTok = BigInt.fromI32(444);

    let destScriptHash = Bytes.fromI32(123123333);
    // Create and validate a partial order which fills the order
    let newOrderMatchedEvent = createOrderMatchedEvent(
      BigInt.fromI32(12),
      orderID,
      amountSats,
      amountSatsFilled,
      pricePerTok,
      stakedTok,
      deadline,
      maker,
      taker,
      destScriptHash
    );

    handleOrderMatched(newOrderMatchedEvent);
    assert.entityCount("Escrow", 2);

    assert.fieldEquals("Escrow", "12", "amountSatsDue", "111");
    assert.fieldEquals("Escrow", "12", "order", "111");
    assert.fieldEquals("Escrow", "12", "deadline", "123123123");
    assert.fieldEquals(
      "Escrow",
      "12",
      "successRecipient",
      "0x0000000000000000000000000000000000000001"
    );
    assert.fieldEquals(
      "Escrow",
      "12",
      "timeoutRecipient",
      "0x0000000000000000000000000000000000000002"
    );
    assert.fieldEquals("Escrow", "12", "status", "PENDING");

    // Validate the order is filled
    assert.fieldEquals("Order", "111", "status", "FILLED");
  });

  test("Order Cancelled", () => {
    let orderID = BigInt.fromI32(111);

    // Create and validate a partial order which fills the order
    let newOrderCancelledEvent = createOrderCancelledEvent(orderID);

    handleOrderCancelled(newOrderCancelledEvent);
    assert.entityCount("Order", 1);

    assert.fieldEquals("Order", "111", "status", "CANCELLED");
  });

  test("Escrow settled", () => {
    let escrowID = BigInt.fromI32(11);
    let amountSatsFilled = BigInt.fromI32(111);
    let taker = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create and validate a partial order which fills the order
    let newEscrowSettledEvent = createEscrowSettledEvent(
      BigInt.fromI32(12),
      amountSatsFilled,
      taker,
      BigInt.fromI32(123)
    );

    handleEscrowSettled(newEscrowSettledEvent);
    assert.entityCount("Escrow", 2);

    assert.fieldEquals("Escrow", "12", "status", "SETTLED");
  });

  test("Escrow slashed", () => {
    let escrowID = BigInt.fromI32(11);
    let amountSatsFilled = BigInt.fromI32(111);
    let taker = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );

    // Create and validate a partial order which fills the order
    let newEscrowSlashedEvent = createEscrowSlashedEvent(
      BigInt.fromI32(12),
      amountSatsFilled,
      taker,
      BigInt.fromI32(123)
    );

    handleEscrowSlashed(newEscrowSlashedEvent);
    assert.entityCount("Escrow", 2);

    assert.fieldEquals("Escrow", "12", "status", "SLASHED");
  });
});
