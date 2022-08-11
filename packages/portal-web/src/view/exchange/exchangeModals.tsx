import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore";
import { BigNumber, ContractTransaction, ethers } from "ethers";
import * as React from "react";
import { createRef } from "react";
import { ERC20, Portal } from "../../../types/ethers-contracts";
import { Escrow } from "../../model/Escrow";
import { Order } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import { parseBitcoinAddr } from "../../utils/bitcoin-addr";
import { getblockClient } from "../../utils/bitcoin-rpc-client";
import { toFloat64 } from "../../utils/math";
import { plural } from "../../utils/plural";
import { createBtcPaymentProof } from "../../utils/prove-bitcoin-tx";
import Addr from "../components/Addr";
import Amount from "../components/Amount";
import Modal from "../components/Modal";

interface TxModalProps {
  portal: Portal & { wbtc: ERC20 };
  connectedAddress: string;
  params: PortalParams;
  bbo: number[];
  addRecentTransaction: (tx: NewTransaction) => void;
  onClose: () => void;
}

export function PleaseConnectModal(props: TxModalProps) {
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
  tokenAllowance?: BigNumber;
  tokenBalance?: BigNumber;
}

class TxModal<P extends TxModalProps> extends React.PureComponent<P> {
  state = { txState: "none" } as TxModalState;

  componentDidMount() {
    this.loadAllowance();
  }

  async loadAllowance() {
    const { connectedAddress, portal } = this.props;
    const { wbtc } = portal;

    console.log(`Loading allowance and balance for ${connectedAddress}`);
    const allowProm = wbtc.allowance(connectedAddress, portal.address);
    const balanceProm = wbtc.balanceOf(connectedAddress);
    const [allowance, balance] = await Promise.all([allowProm, balanceProm]);
    console.log({
      allowance: allowance.toString(),
      balance: balance.toString(),
    });

    this.setState({ tokenAllowance: allowance, tokenBalance: balance });
  }

  trySend = async (
    fn: () => Promise<{ description: string; tx: ContractTransaction }>,
    keepOpen?: boolean
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
    if (receipt.status && !keepOpen) setTimeout(this.props.onClose, 500);
  };

  renderActionOrApproveButton(
    dueTok: BigNumber,
    actionText: string,
    action: () => void
  ): React.ReactNode {
    const status = this.getApprovalStatus(dueTok);

    return (
      <>
        <div className="exchange-row">
          <button
            onClick={status === "allowance" ? this.approve : action}
            disabled={
              this.disableTx() || status == null || status === "balance"
            }
          >
            {status === "allowance" ? "Approve WBTC" : actionText}
          </button>
        </div>
        {this.renderTxStatus(
          status === "balance" ? "Insufficient WBTC balance" : undefined
        )}
      </>
    );
  }

  renderTxStatus(extraError?: string): React.ReactElement {
    let { txState, errorMessage } = this.state;

    if (extraError != null) {
      txState = "failed";
      errorMessage = extraError;
    }

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

  /**
   * Returns "ok" if we have balance+allowance,
   * "allowance" if insufficent allowance,
   * "balance" if low balance,
   * undefined if not yet sure. */
  getApprovalStatus(tok: BigNumber): "ok" | "balance" | "allowance" | null {
    const { tokenAllowance, tokenBalance } = this.state;
    if (tokenBalance == null || tokenBalance == null) return null;
    if (tokenAllowance.lt(tok)) return "allowance";
    if (tokenBalance.lt(tok)) return "balance";
    return "ok";
  }

  approve = async () => {
    await this.trySend(async () => {
      const { portal } = this.props;
      const tx = await portal.wbtc.approve(
        portal.address,
        ethers.constants.MaxUint256
      );
      return { description: "Allow WBTC", tx };
    }, true);

    await this.loadAllowance();
  };

  renderBtc(amountSats: BigNumber | number) {
    return (toFloat64(amountSats) / 1e8).toFixed(4);
  }

  renderBtcNode(amountSats: number) {
    return (
      <>
        <strong>{this.renderBtc(amountSats)}</strong> BTC
      </>
    );
  }

  renderEscrowDuration() {
    return this.props.params.escrowDurationHours + "h";
  }

  renderTok(amountTok: BigNumber | number) {
    return (toFloat64(amountTok) / 1e8).toFixed(4);
  }

  renderPrice(tps: BigNumber | number) {
    return (toFloat64(tps) / 1e10).toFixed(4);
  }

  calcTotalTok(
    amountSat: BigNumber | number,
    priceTps: BigNumber | number
  ): BigNumber {
    // Hardcode WBTC for now.
    // One WBTC = 1e8 units, decimals() = 8. Tps is "wei" (1e-18) per satoshi.
    return BigNumber.from(priceTps).mul(amountSat).div(1e10);
  }

  calcStakeTok(totalTok: BigNumber): BigNumber {
    const { stakePercent } = this.props.params;
    if (stakePercent == null || !(stakePercent > 0)) {
      throw new Error("Missing stake percentage");
    }
    const stakeTok = totalTok.mul(stakePercent).div(100);
    return stakeTok;
  }
}

type ConfirmOrderProps = TxModalProps & {
  type: "bid" | "ask";
  amountSats: number;
  tps: number;
};

export class ConfirmOrderModal extends TxModal<ConfirmOrderProps> {
  refDestAddr = createRef<HTMLInputElement>();

  post = () => {
    if (this.disableTx()) return;
    if (this.props.type === "bid") this.trySend(this.postBidTx);
    else this.trySend(this.postAskTx);
  };

  render() {
    const { type, amountSats, tps } = this.props;

    const priceStr = (tps / 1e10).toFixed(4);

    const totalTok = this.calcTotalTok(amountSats, tps);
    const totalStr = this.renderTok(totalTok);
    const stakeTok = this.calcStakeTok(totalTok);
    const stakeStr = this.renderTok(stakeTok);

    const dueTok = type == "ask" ? stakeTok : totalTok;

    return (
      <Modal title={"Confirm " + type} onClose={this.props.onClose}>
        <div className="exchange-row">
          You're offering to {type === "bid" ? "buy" : "sell"}{" "}
          {this.renderBtcNode(amountSats)}.
        </div>
        <div className="exchange-row">
          <span className="exchange-llabel">Price</span>
          <span className="exchange-ramount">
            <strong>{priceStr}</strong>
          </span>
          <span>WBTC</span>
        </div>
        <div className="exchange-row">
          <span className="exchange-llabel">
            {type === "bid" ? "➡️ Due now" : "You receive"}
          </span>
          <span className="exchange-ramount">
            <strong>{totalStr}</strong>
          </span>
          <span>WBTC</span>
        </div>
        {type === "ask" && (
          <>
            <div className="exchange-row">
              <span className="exchange-llabel">➡️ Due now</span>
              <span className="exchange-ramount">
                <strong>{stakeStr}</strong>
              </span>
              <span>WBTC refundable stake</span>
            </div>
            <div className="exchange-row">
              <blockquote>
                <div className="exchange-row">
                  Each time your order is filled, you'll have{" "}
                  {this.renderEscrowDuration()} to send Bitcoin. Once you prove
                  payment, stake will be refunded.
                </div>
                <div className="exchange-row">
                  You can cancel your remaining order at any time, which will
                  also return your stake.
                </div>
              </blockquote>
            </div>
          </>
        )}
        {type === "bid" && (
          <>
            <div className="exchange-row">
              <label>Destination Bitcoin address. Must start with 2.</label>
              <input ref={this.refDestAddr} placeholder="2..."></input>
            </div>
            <div className="exchange-row">
              <blockquote>
                <div className="exchange-row">
                  Each time your order is filled, you'll receive Bitcoin. You
                  can cancel your order at any time, which will return any
                  remaining WBTC.
                </div>
              </blockquote>
            </div>
          </>
        )}
        {this.renderActionOrApproveButton(dueTok, "Confirm", this.post)}
      </Modal>
    );
  }

  postAskTx = async () => {
    // Validate amounts
    const { amountSats, tps } = this.props;
    const totalTok = this.calcTotalTok(amountSats, tps);
    const stakeTok = this.calcStakeTok(totalTok);

    // Send it
    const pricePerBtc = tps / 1e10;
    const priceStr = pricePerBtc.toFixed(4);
    const description = `Ask ${priceStr} x ${this.renderBtc(amountSats)} BTC`;
    console.log(description, { amountSats, tps, stakeTok });

    const { portal } = this.props;
    const tx = await portal.postAsk(amountSats, tps);

    return { description, tx };
  };

  postBidTx = async () => {
    // Validate amounts
    const { amountSats, tps } = this.props;
    const valueTok = this.calcTotalTok(amountSats, tps);

    // Validate Bitcoin address
    const destAddr = parseBitcoinAddr(this.refDestAddr.current.value);
    if (!destAddr.supported) throw new Error("Unsupported address type");
    const { btcNetwork } = this.props.params;
    if (destAddr.network !== btcNetwork) throw new Error(`Use ${btcNetwork}`);
    const scriptHash = destAddr.scriptHash;

    // Send
    const priceStr = tps.toFixed(4);
    const description = `Bid ${priceStr} x ${this.renderBtc(amountSats)} BTC`;
    console.log(description, { tps, scriptHash, valueTok });

    const { portal } = this.props;
    const tx = await portal.postBid(amountSats, tps, scriptHash);

    return { description, tx };
  };
}

type ConfirmTradeProps = TxModalProps & {
  type: "buy" | "sell";
  order: Order;
  amountSats: number;
};

export class ConfirmTradeModal extends TxModal<ConfirmTradeProps> {
  refDestAddr = createRef<HTMLInputElement>();

  post = () => {
    if (this.disableTx()) return;
    if (this.props.type === "buy") this.trySend(this.buyTx);
    else this.trySend(this.sellTx);
  };

  render() {
    const { type, amountSats, order } = this.props;

    const priceStr = this.renderPrice(order.priceTps);

    const totalTok = this.calcTotalTok(amountSats, order.priceTps);
    const totalStr = this.renderTok(totalTok);
    const stakeTok = this.calcStakeTok(totalTok);
    const stakeStr = this.renderTok(stakeTok);

    const dueTok = type == "sell" ? stakeTok : totalTok;

    return (
      <Modal title={"Confirm " + type} onClose={this.props.onClose}>
        <div className="exchange-row">
          You're {type}ing {this.renderBtcNode(amountSats)}.
        </div>
        <div className="exchange-row">
          <span className="exchange-llabel">Price</span>
          <span className="exchange-ramount">
            <strong>{priceStr}</strong>
          </span>
          <span>WBTC</span>
        </div>
        <div className="exchange-row">
          <span className="exchange-llabel">
            {type === "buy" ? "➡️ Due now" : "You receive"}
          </span>
          <span className="exchange-ramount">
            <strong>{totalStr}</strong>
          </span>
          <span>WBTC</span>
        </div>
        {type === "sell" && (
          <>
            <div className="exchange-row">
              <span className="exchange-llabel">➡️ Due now</span>
              <span className="exchange-ramount">
                <strong>{stakeStr}</strong>
              </span>
              <span>WBTC refundable stake</span>
            </div>
            <div className="exchange-row">
              <blockquote>
                <div className="exchange-row">
                  You'll have {this.renderEscrowDuration()} to send Bitcoin.
                  Once you prove payment, you'll get your stake back plus the
                  WBTC you bought.
                </div>
                <div className="exchange-row">
                  Stake is necessary to prevent a free option. Otherwise, people
                  would trade, then settle only if the price moves in their
                  favor.
                </div>
              </blockquote>
            </div>
          </>
        )}
        {type === "buy" && (
          <div className="exchange-row">
            <label>Destination Bitcoin address. Must start with 2.</label>
            <input ref={this.refDestAddr} placeholder="2..."></input>
          </div>
        )}
        {this.renderActionOrApproveButton(dueTok, "Confirm", this.post)}
      </Modal>
    );
  }

  sellTx = async () => {
    // Calculate amounts
    const { order, amountSats, portal } = this.props;
    const { orderID, priceTps } = order;
    const amountTok = this.calcTotalTok(amountSats, priceTps);
    const stakeTok = this.calcStakeTok(amountTok);

    // Send it
    const wbtcStr = this.renderTok(amountTok);
    const btcStr = this.renderBtc(amountSats);
    const description = `Sell ${btcStr} BTC, receive ${wbtcStr} WBTC`;
    console.log(description, { orderID, amountSats, stakeTok });

    const tx = await portal.initiateSell(orderID, amountSats);

    return { description, tx };
  };

  buyTx = async () => {
    // Calculate amount
    const { order, params, amountSats, portal } = this.props;
    const { orderID, priceTps } = order;
    const amountTok = this.calcTotalTok(amountSats, priceTps);

    // Validate destination address
    const destAddrStr = this.refDestAddr.current.value;
    const destAddr = parseBitcoinAddr(destAddrStr);
    if (!destAddr.supported) throw new Error("Unsupported address");
    const { btcNetwork } = params;
    if (destAddr.network !== btcNetwork) throw new Error("Use " + btcNetwork);
    const scriptHash = destAddr.scriptHash;

    // Send it
    const wbtcStr = this.renderTok(amountTok);
    const btcStr = this.renderBtc(amountSats);
    const description = `Buy ${btcStr} BTC, paying ${wbtcStr} WBTC`;
    console.log(description, { orderID, amountSats, amountTok });
    const tx = await portal.initiateBuy(orderID, amountSats, scriptHash);

    return { description, tx };
  };
}

type OrderModalProps = TxModalProps & { order: Order };

export class CancelModal extends TxModal<OrderModalProps> {
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
    const { amountSats, priceTps } = order;
    let aType: string;
    let refundTok: BigNumber;
    if (amountSats.isNegative()) {
      aType = "a bid";
      refundTok = this.calcTotalTok(amountSats, priceTps);
    } else {
      aType = "an ask";
      refundTok = order.stakedTok;
    }

    return (
      <Modal title="Cancel" onClose={this.props.onClose}>
        <div className="exchange-row">
          You are cancelling {aType} order. You will receive a refund of{" "}
          {this.renderTok(refundTok)} WBTC.
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

type EscrowProps = TxModalProps & { escrow: Escrow };

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
    const amountBtc = this.renderBtc(proof.amountSats);
    const amountWbtc = this.renderTok(escrow.escrowTok);
    const description = `Prove ${amountBtc} BTC, recv ${amountWbtc} WBTC`;
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
    const { escrowTok } = escrow;

    // Send it
    const description = `Slash escrow, take ${this.renderTok(escrowTok)} ETH`;

    const tx = await portal.slash(escrow.escrowId);

    return { description, tx };
  };

  render() {
    const { escrow } = this.props;
    return (
      <Modal title="Timed out, slash escrow" onClose={this.props.onClose}>
        <div className="exchange-row">
          A counterparty owed you Bitcoin, but didn't pay in time. You will
          receive {this.renderTok(escrow.escrowTok)} WBTC from escrow.
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
