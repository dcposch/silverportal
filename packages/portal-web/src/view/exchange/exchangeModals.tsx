import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore";
import { BigNumber, ContractTransaction } from "ethers";
import * as React from "react";
import { createRef } from "react";
import { Portal } from "../../../types/ethers-contracts";
import { Escrow } from "../../model/Escrow";
import { Order } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import { parseBitcoinAddr } from "../../utils/bitcoin-addr";
import { getblockClient } from "../../utils/bitcoin-rpc-client";
import { toFloat64 } from "../../utils/math";
import { plural } from "../../utils/plural";
import { createBtcPaymentProof } from "../../utils/prove-bitcoin-tx";
import Addr from "../components/Addr";
import Amount, { formatAmount } from "../components/Amount";
import Modal from "../components/Modal";

interface BidAskProps {
  portal: Portal;
  params: PortalParams;
  bbo: number[];
  addRecentTransaction: (tx: NewTransaction) => void;
  onClose: () => void;
}

export function PleaseConnectModal(props: BidAskProps) {
  return (
    <Modal title="Connect a wallet" onClose={props.onClose}>
      <p>
        You'll need Ropsten to use Silver Portal. There are many Ropsten
        faucets, but the best is Paradigm's Multi Faucet.
      </p>
      <div>
        You'll also to use the Bitcoin testnet. The easiest way is to create a
        wallet on <a href="https://block.io/dashboard/btctest">Block.io</a>. The
        address should start with <code>2</code>. You can get testnet BTC from{" "}
        <a href="https://coinfaucet.eu/en/btc-testnet/">this faucet</a>.
      </div>
    </Modal>
  );
}

interface TxModalState {
  txState: "none" | "started" | "pending" | "succeeded" | "failed";
  errorMessage?: string;
}

class TxModal<P extends BidAskProps> extends React.PureComponent<P> {
  state = { txState: "none" } as TxModalState;

  trySend = async (
    fn: () => Promise<{ description: string; tx: ContractTransaction }>
  ) => {
    this.setState({ txState: "started", errorMessage: undefined });

    // Create and send the transaction
    let description: string;
    let tx: ContractTransaction;
    try {
      const ret = await fn();
      description = ret.description;
      tx = ret.tx;
    } catch (e) {
      console.log("Error", { e });
      const errorMessage = (e.reason || e.message).substring(0, 200);
      this.setState({ txState: "failed", errorMessage });
      return;
    }
    this.setState({ txState: "pending" });

    // Log it in RainbowKit
    this.props.addRecentTransaction({ hash: tx.hash, description });

    // Wait for it to confirm
    const { provider } = this.props.portal;
    const receipt = await provider.waitForTransaction(tx.hash);
    this.setState({ txState: receipt.status ? "succeeded" : "failed" });

    // Close the modal on success
    if (receipt.status) setTimeout(this.props.onClose, 500);
  };

  renderTxStatus(): React.ReactElement {
    const { txState, errorMessage } = this.state;

    const cl = ["exchange-tx-status"];
    if (txState === "succeeded") cl.push("exchange-tx-succeeded");
    if (txState === "failed") cl.push("exchange-tx-failed");
    return (
      <div className={cl.join(" ")}>
        {txState === "none" && "\u00A0"}
        {txState === "started" && "\u00A0"}
        {txState === "pending" &&
          "Transaction submitted. Waiting for confirmation..."}
        {txState === "succeeded" && "Transaction succeeded."}
        {txState === "failed" && (errorMessage || "Transaction failed.")}
      </div>
    );
  }

  disableTx(): boolean {
    return !["none", "succeeded", "failed"].includes(this.state.txState);
  }
}

export class BidModal extends TxModal<BidAskProps> {
  refBidAmount = createRef<HTMLInputElement>();
  refBidPrice = createRef<HTMLInputElement>();

  postBid = () => {
    if (this.disableTx()) return;
    this.trySend(this.postBidTx);
  };

  postBidTx = async () => {
    // Validate amounts
    const amountSats = Math.round(
      Number(this.refBidAmount.current.value) * 1e8
    );
    if (!(amountSats > 0)) throw new Error("Must enter an amount");

    const priceBtcPerEth = Number(this.refBidPrice.current.value);
    if (!(priceBtcPerEth > 0)) throw new Error("Must enter a price");
    const priceWeiPerSat = Math.floor(1 / priceBtcPerEth) * 1e10;
    if (this.props.bbo[1] > priceWeiPerSat) {
      throw new Error("Can't bid above the current best ask");
    }
    const totalWei = BigNumber.from(amountSats).mul(
      BigNumber.from(priceWeiPerSat)
    );

    // Validate stake
    const { stakePercent } = this.props.params;
    if (stakePercent == null || !(stakePercent > 0)) {
      throw new Error("Missing stake percentage");
    }
    const stakeWei = totalWei.mul(stakePercent).div(100);

    // Send it
    const priceStr = priceBtcPerEth.toFixed(5);
    const description = `Bid ${priceStr} x ${amountSats / 1e8} BTC`;
    console.log(description, { amountSats, priceWeiPerSat, stakeWei });

    const { portal } = this.props;
    const tx = await portal.postBid(amountSats, priceWeiPerSat, {
      value: stakeWei,
    });

    return { description, tx };
  };

  render() {
    const bestBidStr = (1e10 / (this.props.bbo[0] || 1e99)).toFixed(5);
    const { stakePercent } = this.props.params;

    return (
      <Modal title="Post bid" onClose={this.props.onClose}>
        <div className="exchange-row">
          <label>ETH buy price. Current best bid: {bestBidStr} BTC</label>
          <input ref={this.refBidPrice} placeholder={bestBidStr}></input>
        </div>
        <div className="exchange-row">
          <label>Amount of BTC you're selling.</label>
          <input ref={this.refBidAmount} placeholder="0"></input>
        </div>
        <div className="exchange-row">
          <button onClick={this.postBid} disabled={this.disableTx()}>
            Post bid
          </button>{" "}
          pays {stakePercent}% refundable stake
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

export class AskModal extends TxModal<BidAskProps> {
  refAskAmount = createRef<HTMLInputElement>();
  refAskPrice = createRef<HTMLInputElement>();
  refDestAddr = createRef<HTMLInputElement>();

  postAsk = () => {
    if (this.disableTx()) return;
    this.trySend(this.postAskTx);
  };

  postAskTx = async () => {
    // Validate amounts
    const amountSats = Math.round(
      Number(this.refAskAmount.current.value) * 1e8
    );
    if (!(amountSats > 0)) throw new Error("Must enter an amount");

    const priceBtcPerEth = Number(this.refAskPrice.current.value);
    if (!(priceBtcPerEth > 0)) throw new Error("Must enter a price");
    const priceWeiPerSat = Math.floor(1 / priceBtcPerEth) * 1e10;
    if (this.props.bbo[0] < priceWeiPerSat) {
      throw new Error("Can't ask below the current best bid");
    }

    const valueWei = BigNumber.from(amountSats).mul(
      BigNumber.from(priceWeiPerSat)
    );

    // Validate Bitcoin address
    const destAddr = parseBitcoinAddr(this.refDestAddr.current.value);
    if (!destAddr.supported) throw new Error("Unsupported address type");
    const { btcNetwork } = this.props.params;
    if (destAddr.network !== btcNetwork) throw new Error(`Use ${btcNetwork}`);
    const scriptHash = destAddr.scriptHash;

    // Send
    const priceStr = priceBtcPerEth.toFixed(5);
    const description = `Ask ${priceStr} x ${amountSats / 1e8} BTC`;
    console.log(description, { priceWeiPerSat, scriptHash, valueWei });

    const { portal } = this.props;
    const tx = await portal.postAsk(priceWeiPerSat, scriptHash, {
      value: valueWei,
    });

    return { description, tx };
  };

  render() {
    const bestAskStr = (1e10 / (this.props.bbo[1] || 1e100)).toFixed(5);

    return (
      <Modal title="Post ask" onClose={this.props.onClose}>
        <div className="exchange-row">
          <label>ETH sell price. Current best ask: {bestAskStr} BTC</label>
          <input ref={this.refAskPrice} placeholder={bestAskStr}></input>
        </div>
        <div className="exchange-row">
          <label>Amount of BTC you're buying.</label>
          <input ref={this.refAskAmount} placeholder="0"></input>
        </div>
        <div className="exchange-row">
          <label>Destination Bitcoin address. Must start with 2.</label>
          <input ref={this.refDestAddr} placeholder="2..."></input>
        </div>
        <div className="exchange-row">
          <button onClick={this.postAsk} disabled={this.disableTx()}>
            Post ask
          </button>
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

type BuySellProps = BidAskProps & { order: Order };

export class BuyModal extends TxModal<BuySellProps> {
  buy = () => {
    if (this.disableTx()) return;
    this.trySend(this.buyTx);
  };

  buyTx = async () => {
    // Calculate amounts
    const { order, params, portal } = this.props;
    const { orderID, priceWeiPerSat } = order;
    const amountSats = order.amountSats.mul(-1);
    const amountWei = priceWeiPerSat.mul(amountSats);
    const stakeWei = amountWei.mul(params.stakePercent).div(100);

    // Send it
    const { amountStr } = formatAmount(amountWei, "wei");
    const priceStr = ((1 / toFloat64(priceWeiPerSat)) * 1e10).toFixed(5);
    const description = `Buy ${amountStr} ETH @ ${priceStr}`;
    console.log(description, { orderID, amountSats, stakeWei });

    const tx = await portal.initiateBuy(orderID, amountSats, {
      value: stakeWei,
    });

    return { description, tx };
  };

  render() {
    const { order, params } = this.props;
    const { priceWeiPerSat, scriptHash } = order;
    const amountSats = order.amountSats.mul(-1);
    const amountWei = priceWeiPerSat.mul(amountSats);
    const price = toFloat64(amountSats) / 1e8 / (toFloat64(amountWei) / 1e18);

    return (
      <Modal title="Buy" onClose={this.props.onClose}>
        <NoPartialFills />
        <div className="exchange-row">
          Buying <Amount n={amountWei} type="wei" /> at a price of{" "}
          <code>{price.toFixed(5)}</code> ETH/BTC.
        </div>
        <div className="exchange-row">
          You'll pay <Amount n={amountSats} type="sats" /> to{" "}
          <Addr scriptHash={scriptHash} network={params.btcNetwork} />.
        </div>
        <div className="exchange-row">
          <button onClick={this.buy} disabled={this.disableTx()}>
            Buy
          </button>{" "}
          pays {params.stakePercent}% refundable stake
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

export class SellModal extends TxModal<BuySellProps> {
  refDestAddr = createRef<HTMLInputElement>();

  sell = () => {
    if (this.disableTx()) return;
    this.trySend(this.sellTx);
  };

  sellTx = async () => {
    // Calculate amount
    const { order, params, portal } = this.props;
    const { orderID, amountSats, priceWeiPerSat } = order;
    const amountWei = priceWeiPerSat.mul(amountSats);

    // Validate destination address
    const destAddrStr = this.refDestAddr.current.value;
    const destAddr = parseBitcoinAddr(destAddrStr);
    if (!destAddr.supported) throw new Error("Unsupported address");
    const { btcNetwork } = params;
    if (destAddr.network !== btcNetwork) throw new Error("Use " + btcNetwork);

    // Send it
    const { amountStr } = formatAmount(amountWei, "wei");
    const priceStr = ((1 / toFloat64(priceWeiPerSat)) * 1e10).toFixed(5);
    const description = `Sell ${amountStr} ETH @ ${priceStr}`;
    const { scriptHash } = destAddr;
    console.log(description, orderID, amountSats, scriptHash, amountWei);

    const tx = await portal.initiateSell(orderID, amountSats, scriptHash, {
      value: amountWei,
    });

    return { description, tx };
  };

  render() {
    const { order } = this.props;
    const { amountSats, priceWeiPerSat } = order;
    const amountWei = priceWeiPerSat.mul(amountSats);
    const price = toFloat64(amountSats) / 1e8 / (toFloat64(amountWei) / 1e18);

    return (
      <Modal title="Sell" onClose={this.props.onClose}>
        <NoPartialFills />
        <div className="exchange-row">
          Selling <Amount n={amountWei} type="wei" /> at a price of{" "}
          <code>{price.toFixed(5)}</code> ETH/BTC.
        </div>
        <div className="exchange-row">
          You'll receive <Amount n={amountSats} type="sats" />.
        </div>
        <div className="exchange-row">
          <label>Destination Bitcoin address. Must start with 2.</label>
          <input ref={this.refDestAddr} placeholder="2..."></input>
        </div>
        <div className="exchange-row">
          <button onClick={this.sell} disabled={this.disableTx()}>
            Sell
          </button>
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

export class CancelModal extends TxModal<BuySellProps> {
  cancel = () => {
    if (this.disableTx()) return;
    this.trySend(this.cancelTx);
  };

  cancelTx = async () => {
    // Send it
    const { portal, order } = this.props;
    const { amountSats, orderID } = order;
    const type = amountSats.isNegative() ? "bid" : "ask";
    const description = `Cancel ${type}`;
    console.log(description, orderID);

    const tx = await portal.cancelOrder(orderID);

    return { description, tx };
  };

  render() {
    const { order } = this.props;
    const { amountSats, priceWeiPerSat } = order;
    const aType = amountSats.isNegative() ? "an ask" : "a bid";
    let refundWei = toFloat64(order.stakedWei);
    if (aType === "an ask") {
      refundWei -= toFloat64(priceWeiPerSat.mul(amountSats));
    }

    return (
      <Modal title="Cancel" onClose={this.props.onClose}>
        <div className="exchange-row">
          You are cancelling {aType} order. You will receive a refund of{" "}
          <Amount n={refundWei} type="wei" decimals={6} />.
        </div>
        <div className="exchange-row">
          Cancellation will fail if the order has already been hit.
        </div>
        <br />
        <div className="exchange-row">
          <button onClick={this.cancel} disabled={this.disableTx()}>
            Cancel Order
          </button>
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

function NoPartialFills() {
  return (
    <blockquote>
      <p>⚠ Silver Portal doesn't support partial fills yet.</p>
    </blockquote>
  );
}

type EscrowProps = BidAskProps & { escrow: Escrow };

export class ProveModal extends TxModal<EscrowProps> {
  refBitcoinTx = createRef<HTMLInputElement>();

  prove = () => {
    if (this.disableTx()) return;
    this.trySend(this.proveTx);
  };

  proveTx = async () => {
    const { escrow, portal } = this.props;
    const txId = this.refBitcoinTx.current.value;

    // Load proof information from Bitcoin RPC
    console.log("Creating proof for Bitcoin tx " + txId);
    const proof = await createBtcPaymentProof(
      getblockClient,
      txId,
      escrow.destScriptHash
    );
    if (proof.amountSats < escrow.amountSatsDue.toNumber()) {
      throw new Error(
        `Incorrect payment. Expected ${escrow.amountSatsDue}, found ${proof.amountSats} satoshis.`
      );
    }

    // Send it
    const { amountStr: amountBtc } = formatAmount(proof.amountSats, "sats");
    const { amountStr: amountEth } = formatAmount(escrow.escrowWei, "wei");
    const description = `Prove ${amountBtc} BTC, recv ${amountEth}`;
    console.log(description, escrow, proof);

    const tx = await portal.proveSettlement(
      escrow.escrowId,
      proof.blockNum,
      proof.inclusionProof,
      proof.txOutIx
    );

    return { description, tx };
  };

  render() {
    const { escrow, params } = this.props;

    const now = new Date().getTime() / 1e3;
    const remainingTotalMins = Math.floor((escrow.deadline - now) / 60);
    const remainingH = Math.floor(remainingTotalMins / 60);
    let timeoutStr: string;
    if (remainingTotalMins < 0) {
      timeoutStr = `⚠️ Payment past due. If you have not already, do NOT send BTC--you may be slashed at any time, losing both your BTC and your stake.`;
    } else if (remainingTotalMins < 60) {
      timeoutStr = `⚠️ Payment proof due in ${remainingTotalMins} mins. If you not already, we do NOT recommend sending BTC. Block times are unpredictable. If your payment takes too long, you may be slashed, losing both your BTC and your stake.`;
    } else {
      timeoutStr = `🕒 Payment due in ${remainingH} hours.`;
    }

    return (
      <Modal title="Prove Bitcoin settlement" onClose={this.props.onClose}>
        <blockquote>
          <p>{timeoutStr}</p>
        </blockquote>
        <div className="exchange-row">
          You owe <Amount n={escrow.amountSatsDue} type="sats" decimals="all" />{" "}
          to{" "}
          <Addr
            scriptHash={escrow.destScriptHash}
            network={params.btcNetwork}
          />
          . Once your payment has{" "}
          {plural(params.btcMinConfirmations, "confirmation")}, prove it below.
        </div>
        <div className="exchange-row">
          <label>Bitcoin transaction ID</label>
          <input ref={this.refBitcoinTx}></input>
        </div>
        <div className="exchange-row">
          <button onClick={this.prove} disabled={this.disableTx()}>
            Prove settlement
          </button>
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}

export class SlashModal extends TxModal<EscrowProps> {
  slash = () => {
    if (this.disableTx()) return;
    this.trySend(this.slashTx);
  };

  slashTx = async () => {
    const { portal, escrow } = this.props;

    // Send it
    const { amountStr } = formatAmount(escrow.escrowWei, "wei");
    const description = `Slash escrow, take ${amountStr} ETH`;

    const tx = await portal.slash(escrow.escrowId);

    return { description, tx };
  };

  render() {
    const { escrow } = this.props;
    return (
      <Modal title="Timed out, slash escrow" onClose={this.props.onClose}>
        <div className="exchange-row">
          A counterparty owed you Bitcoin, but didn't pay in time. You will
          receive the <Amount n={escrow.escrowWei} type="wei" /> from escrow.
        </div>
        <div className="exchange-row">
          <button onClick={this.slash} disabled={this.disableTx()}>
            Slash
          </button>
        </div>
        {this.renderTxStatus()}
      </Modal>
    );
  }
}
