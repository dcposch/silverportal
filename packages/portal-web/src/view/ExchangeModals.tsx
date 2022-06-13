import "./ExchangeModals.css";

import * as React from "react";
import { createRef, ReactNode, useEffect } from "react";
import { Portal } from "../../types/ethers-contracts";
import PortalParams from "../utils/PortalParams";

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    console.log("escape");
    const onP = (k: KeyboardEvent) => k.code === "Escape" && onClose();
    document.addEventListener("keydown", onP);
    return () => document.removeEventListener("keydown", onP);
  }, []);

  return (
    <div className="modal-wrap">
      <div className="modal-window">
        <h2 className="modal-header">
          <span>{title}</span>
          <button className="modal-close" onClick={onClose}>
            ❌
          </button>
        </h2>
        {children}
      </div>
    </div>
  );
}

interface BidAskProps {
  portal: Portal;
  params: PortalParams;
  onClose: () => void;
}

export class BidModal extends React.PureComponent<BidAskProps> {
  refBidAmount = createRef<HTMLInputElement>();
  refBidPrice = createRef<HTMLInputElement>();

  placeBid = () => {
    const amountSats = Number(this.refBidAmount.current.value) * 1e8;
    const priceWeiPerSat = Number(this.refBidPrice.current.value) * 1e10;
    if (!(amountSats > 0) || !(priceWeiPerSat > 0)) {
      return; // Ignore invalid or non-numerical inputs
    }

    const { stakePercent } = this.props.params;
    if (stakePercent == null || !(stakePercent > 0)) {
      throw new Error("Missing stake percentage");
    }

    const totalWei = amountSats * priceWeiPerSat;
    const stakeWei = (totalWei * stakePercent) / 100;
    console.log(
      "Place bid " +
        JSON.stringify({ amountSats, priceWeiPerSat, stakeWei, stakePercent })
    );

    this.props.portal.postBid(amountSats, priceWeiPerSat, {
      value: stakeWei,
    });
  };

  render() {
    const { stakePercent } = this.props.params;

    return (
      <Modal title="Place bid" onClose={this.props.onClose}>
        <p>Requires {stakePercent}% stake</p>
        <label>Amount of BTC you're selling.</label>
        <input ref={this.refBidAmount} defaultValue={0.01}></input>
        <label>Price you will pay, in ETH per BTC.</label>
        <input ref={this.refBidPrice} defaultValue={18}></input>
        <button onClick={this.placeBid}>Place bid</button>
      </Modal>
    );
  }
}

export class AskModal extends React.PureComponent<BidAskProps> {
  render() {
    return (
      <Modal title="Place ask" onClose={this.props.onClose}>
        <label>Amount of BTC you're buying.</label>
        <input></input>
        <label>Price you will pay, in ETH per BTC.</label>
        <input></input>
        <button onClick={null}>Place ask</button>
      </Modal>
    );
  }
}

type BuySellProps = BidAskProps & { orderID: number };

export class BuyModal extends React.PureComponent<BuySellProps> {
  render() {
    return (
      <Modal title="Buy" onClose={this.props.onClose}>
        TODO
      </Modal>
    );
  }
}

export class SellModal extends React.PureComponent<BuySellProps> {
  render() {
    return (
      <Modal title="Sell" onClose={this.props.onClose}>
        TODO
      </Modal>
    );
  }
}

type EscrowProps = BidAskProps & { escrowID: number };

export class ProveModal extends React.PureComponent<EscrowProps> {
  render() {
    return (
      <Modal title="Prove Bitcoin settlement" onClose={this.props.onClose}>
        TODO
      </Modal>
    );
  }
}

export class SlashModal extends React.PureComponent<EscrowProps> {
  render() {
    return (
      <Modal title="Timed out, slash escrow" onClose={this.props.onClose}>
        TODO
      </Modal>
    );
  }
}
