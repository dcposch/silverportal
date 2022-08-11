/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type BtcTxProofStruct = {
  blockHeader: PromiseOrValue<BytesLike>;
  txId: PromiseOrValue<BytesLike>;
  txIndex: PromiseOrValue<BigNumberish>;
  txMerkleProof: PromiseOrValue<BytesLike>;
  rawTx: PromiseOrValue<BytesLike>;
};

export type BtcTxProofStructOutput = [
  string,
  string,
  BigNumber,
  string,
  string
] & {
  blockHeader: string;
  txId: string;
  txIndex: BigNumber;
  txMerkleProof: string;
  rawTx: string;
};

export interface PortalInterface extends utils.Interface {
  functions: {
    "btcVerifier()": FunctionFragment;
    "cancelOrder(uint256)": FunctionFragment;
    "escrows(uint256)": FunctionFragment;
    "initiateBuy(uint256,uint128,bytes20)": FunctionFragment;
    "initiateSell(uint256,uint128)": FunctionFragment;
    "minConfirmations()": FunctionFragment;
    "minOrderSats()": FunctionFragment;
    "nextEscrowID()": FunctionFragment;
    "nextOrderID()": FunctionFragment;
    "openEscrowInflight(bytes20,uint256)": FunctionFragment;
    "openEscrowKey(bytes20,uint256)": FunctionFragment;
    "openEscrows(bytes32)": FunctionFragment;
    "orderbook(uint256)": FunctionFragment;
    "owner()": FunctionFragment;
    "postAsk(uint256,uint256)": FunctionFragment;
    "postBid(uint256,uint256,bytes20)": FunctionFragment;
    "proveSettlement(uint256,uint256,(bytes,bytes32,uint256,bytes,bytes),uint256)": FunctionFragment;
    "setBtcVerifier(address)": FunctionFragment;
    "setMinConfirmations(uint256)": FunctionFragment;
    "setMinOrderSats(uint256)": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "setStakePercent(uint256)": FunctionFragment;
    "setTickTps(uint256)": FunctionFragment;
    "slash(uint256)": FunctionFragment;
    "stakePercent()": FunctionFragment;
    "tickTps()": FunctionFragment;
    "tokDiv()": FunctionFragment;
    "token()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "btcVerifier"
      | "cancelOrder"
      | "escrows"
      | "initiateBuy"
      | "initiateSell"
      | "minConfirmations"
      | "minOrderSats"
      | "nextEscrowID"
      | "nextOrderID"
      | "openEscrowInflight"
      | "openEscrowKey"
      | "openEscrows"
      | "orderbook"
      | "owner"
      | "postAsk"
      | "postBid"
      | "proveSettlement"
      | "setBtcVerifier"
      | "setMinConfirmations"
      | "setMinOrderSats"
      | "setOwner"
      | "setStakePercent"
      | "setTickTps"
      | "slash"
      | "stakePercent"
      | "tickTps"
      | "tokDiv"
      | "token"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "btcVerifier",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "cancelOrder",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "escrows",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "initiateBuy",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "initiateSell",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "minConfirmations",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "minOrderSats",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "nextEscrowID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "nextOrderID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "openEscrowInflight",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "openEscrowKey",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "openEscrows",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "orderbook",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "postAsk",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "postBid",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "proveSettlement",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      BtcTxProofStruct,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setBtcVerifier",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMinConfirmations",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMinOrderSats",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setOwner",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setStakePercent",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "setTickTps",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "slash",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "stakePercent",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "tickTps", values?: undefined): string;
  encodeFunctionData(functionFragment: "tokDiv", values?: undefined): string;
  encodeFunctionData(functionFragment: "token", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "btcVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancelOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "escrows", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initiateBuy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "initiateSell",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minConfirmations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "minOrderSats",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nextEscrowID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "nextOrderID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "openEscrowInflight",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "openEscrowKey",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "openEscrows",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "orderbook", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "postAsk", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "postBid", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proveSettlement",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBtcVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMinConfirmations",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMinOrderSats",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setStakePercent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setTickTps", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "slash", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "stakePercent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tickTps", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "tokDiv", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token", data: BytesLike): Result;

  events: {
    "EscrowSettled(uint256,uint256,address,uint256)": EventFragment;
    "EscrowSlashed(uint256,uint256,address,uint256)": EventFragment;
    "OrderCancelled(uint256)": EventFragment;
    "OrderMatched(uint256,uint256,int128,int128,uint128,uint256,uint128,address,address,bytes20)": EventFragment;
    "OrderPlaced(uint256,int128,uint128,uint256,address)": EventFragment;
    "OwnerUpdated(address,address)": EventFragment;
    "ParamUpdated(uint256,uint256,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "EscrowSettled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "EscrowSlashed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderCancelled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderMatched"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OrderPlaced"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnerUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ParamUpdated"): EventFragment;
}

export interface EscrowSettledEventObject {
  escrowID: BigNumber;
  amountSats: BigNumber;
  ethDest: string;
  ethAmount: BigNumber;
}
export type EscrowSettledEvent = TypedEvent<
  [BigNumber, BigNumber, string, BigNumber],
  EscrowSettledEventObject
>;

export type EscrowSettledEventFilter = TypedEventFilter<EscrowSettledEvent>;

export interface EscrowSlashedEventObject {
  escrowID: BigNumber;
  escrowDeadline: BigNumber;
  ethDest: string;
  ethAmount: BigNumber;
}
export type EscrowSlashedEvent = TypedEvent<
  [BigNumber, BigNumber, string, BigNumber],
  EscrowSlashedEventObject
>;

export type EscrowSlashedEventFilter = TypedEventFilter<EscrowSlashedEvent>;

export interface OrderCancelledEventObject {
  orderID: BigNumber;
}
export type OrderCancelledEvent = TypedEvent<
  [BigNumber],
  OrderCancelledEventObject
>;

export type OrderCancelledEventFilter = TypedEventFilter<OrderCancelledEvent>;

export interface OrderMatchedEventObject {
  escrowID: BigNumber;
  orderID: BigNumber;
  amountSats: BigNumber;
  amountSatsFilled: BigNumber;
  priceTps: BigNumber;
  takerStakedTok: BigNumber;
  deadline: BigNumber;
  maker: string;
  taker: string;
  destScriptHash: string;
}
export type OrderMatchedEvent = TypedEvent<
  [
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    string,
    string,
    string
  ],
  OrderMatchedEventObject
>;

export type OrderMatchedEventFilter = TypedEventFilter<OrderMatchedEvent>;

export interface OrderPlacedEventObject {
  orderID: BigNumber;
  amountSats: BigNumber;
  priceTps: BigNumber;
  makerStakedTok: BigNumber;
  maker: string;
}
export type OrderPlacedEvent = TypedEvent<
  [BigNumber, BigNumber, BigNumber, BigNumber, string],
  OrderPlacedEventObject
>;

export type OrderPlacedEventFilter = TypedEventFilter<OrderPlacedEvent>;

export interface OwnerUpdatedEventObject {
  user: string;
  newOwner: string;
}
export type OwnerUpdatedEvent = TypedEvent<
  [string, string],
  OwnerUpdatedEventObject
>;

export type OwnerUpdatedEventFilter = TypedEventFilter<OwnerUpdatedEvent>;

export interface ParamUpdatedEventObject {
  oldVal: BigNumber;
  newVal: BigNumber;
  name: string;
}
export type ParamUpdatedEvent = TypedEvent<
  [BigNumber, BigNumber, string],
  ParamUpdatedEventObject
>;

export type ParamUpdatedEventFilter = TypedEventFilter<ParamUpdatedEvent>;

export interface Portal extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PortalInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    btcVerifier(overrides?: CallOverrides): Promise<[string]>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string, string] & {
        destScriptHash: string;
        amountSatsDue: BigNumber;
        deadline: BigNumber;
        escrowTok: BigNumber;
        successRecipient: string;
        timeoutRecipient: string;
      }
    >;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    minConfirmations(overrides?: CallOverrides): Promise<[BigNumber]>;

    minOrderSats(overrides?: CallOverrides): Promise<[BigNumber]>;

    nextEscrowID(overrides?: CallOverrides): Promise<[BigNumber]>;

    nextOrderID(overrides?: CallOverrides): Promise<[BigNumber]>;

    openEscrowInflight(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    openEscrowKey(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    openEscrows(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, string, BigNumber] & {
        maker: string;
        amountSats: BigNumber;
        priceTps: BigNumber;
        scriptHash: string;
        stakedTok: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<[string]>;

    postAsk(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setBtcVerifier(
      _btcVerifier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMinConfirmations(
      _minConfirmations: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMinOrderSats(
      _minOrderSats: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setStakePercent(
      _stakePercent: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setTickTps(
      _tickTps: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    stakePercent(overrides?: CallOverrides): Promise<[BigNumber]>;

    tickTps(overrides?: CallOverrides): Promise<[BigNumber]>;

    tokDiv(overrides?: CallOverrides): Promise<[BigNumber]>;

    token(overrides?: CallOverrides): Promise<[string]>;
  };

  btcVerifier(overrides?: CallOverrides): Promise<string>;

  cancelOrder(
    orderID: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  escrows(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, string, string] & {
      destScriptHash: string;
      amountSatsDue: BigNumber;
      deadline: BigNumber;
      escrowTok: BigNumber;
      successRecipient: string;
      timeoutRecipient: string;
    }
  >;

  initiateBuy(
    orderID: PromiseOrValue<BigNumberish>,
    amountSats: PromiseOrValue<BigNumberish>,
    destScriptHash: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initiateSell(
    orderID: PromiseOrValue<BigNumberish>,
    amountSats: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  minConfirmations(overrides?: CallOverrides): Promise<BigNumber>;

  minOrderSats(overrides?: CallOverrides): Promise<BigNumber>;

  nextEscrowID(overrides?: CallOverrides): Promise<BigNumber>;

  nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

  openEscrowInflight(
    scriptHash: PromiseOrValue<BytesLike>,
    amountSats: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  openEscrowKey(
    scriptHash: PromiseOrValue<BytesLike>,
    amountSats: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  openEscrows(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  orderbook(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, string, BigNumber] & {
      maker: string;
      amountSats: BigNumber;
      priceTps: BigNumber;
      scriptHash: string;
      stakedTok: BigNumber;
    }
  >;

  owner(overrides?: CallOverrides): Promise<string>;

  postAsk(
    amountSats: PromiseOrValue<BigNumberish>,
    priceTps: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  postBid(
    amountSats: PromiseOrValue<BigNumberish>,
    priceTps: PromiseOrValue<BigNumberish>,
    scriptHash: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  proveSettlement(
    escrowID: PromiseOrValue<BigNumberish>,
    bitcoinBlockNum: PromiseOrValue<BigNumberish>,
    bitcoinTransactionProof: BtcTxProofStruct,
    txOutIx: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setBtcVerifier(
    _btcVerifier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMinConfirmations(
    _minConfirmations: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMinOrderSats(
    _minOrderSats: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setOwner(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setStakePercent(
    _stakePercent: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setTickTps(
    _tickTps: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  slash(
    escrowID: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  stakePercent(overrides?: CallOverrides): Promise<BigNumber>;

  tickTps(overrides?: CallOverrides): Promise<BigNumber>;

  tokDiv(overrides?: CallOverrides): Promise<BigNumber>;

  token(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    btcVerifier(overrides?: CallOverrides): Promise<string>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, string, string] & {
        destScriptHash: string;
        amountSatsDue: BigNumber;
        deadline: BigNumber;
        escrowTok: BigNumber;
        successRecipient: string;
        timeoutRecipient: string;
      }
    >;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    minConfirmations(overrides?: CallOverrides): Promise<BigNumber>;

    minOrderSats(overrides?: CallOverrides): Promise<BigNumber>;

    nextEscrowID(overrides?: CallOverrides): Promise<BigNumber>;

    nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

    openEscrowInflight(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    openEscrowKey(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;

    openEscrows(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, string, BigNumber] & {
        maker: string;
        amountSats: BigNumber;
        priceTps: BigNumber;
        scriptHash: string;
        stakedTok: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<string>;

    postAsk(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setBtcVerifier(
      _btcVerifier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMinConfirmations(
      _minConfirmations: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMinOrderSats(
      _minOrderSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setStakePercent(
      _stakePercent: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    setTickTps(
      _tickTps: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    stakePercent(overrides?: CallOverrides): Promise<BigNumber>;

    tickTps(overrides?: CallOverrides): Promise<BigNumber>;

    tokDiv(overrides?: CallOverrides): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "EscrowSettled(uint256,uint256,address,uint256)"(
      escrowID?: null,
      amountSats?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSettledEventFilter;
    EscrowSettled(
      escrowID?: null,
      amountSats?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSettledEventFilter;

    "EscrowSlashed(uint256,uint256,address,uint256)"(
      escrowID?: null,
      escrowDeadline?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSlashedEventFilter;
    EscrowSlashed(
      escrowID?: null,
      escrowDeadline?: null,
      ethDest?: null,
      ethAmount?: null
    ): EscrowSlashedEventFilter;

    "OrderCancelled(uint256)"(orderID?: null): OrderCancelledEventFilter;
    OrderCancelled(orderID?: null): OrderCancelledEventFilter;

    "OrderMatched(uint256,uint256,int128,int128,uint128,uint256,uint128,address,address,bytes20)"(
      escrowID?: null,
      orderID?: null,
      amountSats?: null,
      amountSatsFilled?: null,
      priceTps?: null,
      takerStakedTok?: null,
      deadline?: null,
      maker?: null,
      taker?: null,
      destScriptHash?: null
    ): OrderMatchedEventFilter;
    OrderMatched(
      escrowID?: null,
      orderID?: null,
      amountSats?: null,
      amountSatsFilled?: null,
      priceTps?: null,
      takerStakedTok?: null,
      deadline?: null,
      maker?: null,
      taker?: null,
      destScriptHash?: null
    ): OrderMatchedEventFilter;

    "OrderPlaced(uint256,int128,uint128,uint256,address)"(
      orderID?: null,
      amountSats?: null,
      priceTps?: null,
      makerStakedTok?: null,
      maker?: null
    ): OrderPlacedEventFilter;
    OrderPlaced(
      orderID?: null,
      amountSats?: null,
      priceTps?: null,
      makerStakedTok?: null,
      maker?: null
    ): OrderPlacedEventFilter;

    "OwnerUpdated(address,address)"(
      user?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnerUpdatedEventFilter;
    OwnerUpdated(
      user?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnerUpdatedEventFilter;

    "ParamUpdated(uint256,uint256,string)"(
      oldVal?: null,
      newVal?: null,
      name?: null
    ): ParamUpdatedEventFilter;
    ParamUpdated(
      oldVal?: null,
      newVal?: null,
      name?: null
    ): ParamUpdatedEventFilter;
  };

  estimateGas: {
    btcVerifier(overrides?: CallOverrides): Promise<BigNumber>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    minConfirmations(overrides?: CallOverrides): Promise<BigNumber>;

    minOrderSats(overrides?: CallOverrides): Promise<BigNumber>;

    nextEscrowID(overrides?: CallOverrides): Promise<BigNumber>;

    nextOrderID(overrides?: CallOverrides): Promise<BigNumber>;

    openEscrowInflight(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    openEscrowKey(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    openEscrows(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    postAsk(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setBtcVerifier(
      _btcVerifier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMinConfirmations(
      _minConfirmations: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMinOrderSats(
      _minOrderSats: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setStakePercent(
      _stakePercent: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setTickTps(
      _tickTps: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    stakePercent(overrides?: CallOverrides): Promise<BigNumber>;

    tickTps(overrides?: CallOverrides): Promise<BigNumber>;

    tokDiv(overrides?: CallOverrides): Promise<BigNumber>;

    token(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    btcVerifier(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    cancelOrder(
      orderID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    escrows(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    initiateBuy(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      destScriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initiateSell(
      orderID: PromiseOrValue<BigNumberish>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    minConfirmations(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    minOrderSats(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nextEscrowID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nextOrderID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    openEscrowInflight(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    openEscrowKey(
      scriptHash: PromiseOrValue<BytesLike>,
      amountSats: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    openEscrows(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    orderbook(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    postAsk(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    postBid(
      amountSats: PromiseOrValue<BigNumberish>,
      priceTps: PromiseOrValue<BigNumberish>,
      scriptHash: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    proveSettlement(
      escrowID: PromiseOrValue<BigNumberish>,
      bitcoinBlockNum: PromiseOrValue<BigNumberish>,
      bitcoinTransactionProof: BtcTxProofStruct,
      txOutIx: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setBtcVerifier(
      _btcVerifier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMinConfirmations(
      _minConfirmations: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMinOrderSats(
      _minOrderSats: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setOwner(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setStakePercent(
      _stakePercent: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setTickTps(
      _tickTps: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    slash(
      escrowID: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    stakePercent(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tickTps(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    tokDiv(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
