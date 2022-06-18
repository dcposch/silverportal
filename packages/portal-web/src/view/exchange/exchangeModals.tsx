import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore";
import { BigNumber } from "ethers";
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

export class BidModal extends React.PureComponent<BidAskProps> {
  refBidAmount = createRef<HTMLInputElement>();
  refBidPrice = createRef<HTMLInputElement>();

  postBid = async () => {
    // Validate amounts
    const amountSats = Math.round(
      Number(this.refBidAmount.current.value) * 1e8
    );

    const priceBtcPerEth = Number(this.refBidPrice.current.value);
    if (!(priceBtcPerEth > 0)) throw new Error("Must enter a price");
    const priceWeiPerSat = Math.floor(1 / priceBtcPerEth) * 1e10;
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

    const tx = await this.props.portal.postBid(amountSats, priceWeiPerSat, {
      value: stakeWei,
    });

    this.props.addRecentTransaction({ hash: tx.hash, description });

    this.props.onClose();
  };

  render() {
    const bestBidStr = (1e10 / (this.props.bbo[0] || 1e100)).toFixed(5);
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
          <button onClick={this.postBid}>Post bid</button> pays {stakePercent}%
          refundable stake
        </div>
      </Modal>
    );
  }
}

export class AskModal extends React.PureComponent<BidAskProps> {
  refAskAmount = createRef<HTMLInputElement>();
  refAskPrice = createRef<HTMLInputElement>();
  refDestAddr = createRef<HTMLInputElement>();

  postAsk = async () => {
    // Validate amounts
    const amountSats = Math.round(
      Number(this.refAskAmount.current.value) * 1e8
    );
    if (!(amountSats > 0)) throw new Error("Must enter an amount");

    const priceBtcPerEth = Number(this.refAskPrice.current.value);
    if (!(priceBtcPerEth > 0)) throw new Error("Must enter a price");
    const priceWeiPerSat = Math.floor(1 / priceBtcPerEth) * 1e10;

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
    const { portal } = this.props;
    const priceStr = priceBtcPerEth.toFixed(5);
    const description = `Ask ${priceStr} x ${amountSats / 1e8} BTC`;
    console.log(description, { priceWeiPerSat, scriptHash, valueWei });

    const tx = await portal.postAsk(priceWeiPerSat, scriptHash, {
      value: valueWei,
    });

    this.props.addRecentTransaction({ description, hash: tx.hash });
    this.props.onClose();
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
          <button onClick={this.postAsk}>Post ask</button>
        </div>
      </Modal>
    );
  }
}

type BuySellProps = BidAskProps & { order: Order };

export class BuyModal extends React.PureComponent<BuySellProps> {
  buy = async () => {
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

    this.props.addRecentTransaction({ description, hash: tx.hash });
    this.props.onClose();
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
          <button onClick={this.buy}>Buy</button> pays {params.stakePercent}%
          refundable stake
        </div>
      </Modal>
    );
  }
}

export class SellModal extends React.PureComponent<BuySellProps> {
  refDestAddr = createRef<HTMLInputElement>();

  sell = async () => {
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

    this.props.addRecentTransaction({ description, hash: tx.hash });
    this.props.onClose();
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
          <button onClick={this.sell}>Sell</button>
        </div>
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

export class ProveModal extends React.PureComponent<EscrowProps> {
  refBitcoinTx = createRef<HTMLInputElement>();

  prove = async () => {
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

    this.props.addRecentTransaction({ description, hash: tx.hash });
    this.props.onClose();
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
          <button onClick={this.prove}>Prove settlement</button>
        </div>
      </Modal>
    );
  }
}

export class SlashModal extends React.PureComponent<EscrowProps> {
  slash = async () => {
    const { portal, escrow } = this.props;

    // Send it
    const { amountStr } = formatAmount(escrow.escrowWei, "wei");
    const description = `Slash escrow, take ${amountStr} ETH`;

    const tx = await portal.slash(escrow.escrowId);

    this.props.addRecentTransaction({ description, hash: tx.hash });
    this.props.onClose();
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
          <button onClick={this.slash}>Slash</button>
        </div>
      </Modal>
    );
  }
}
