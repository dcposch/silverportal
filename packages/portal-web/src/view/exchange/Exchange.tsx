import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore";
import * as React from "react";
import { Portal } from "../../../types/ethers-contracts";
import {
  loadEscrowForAddr,
  loadOrderbook,
  loadParams,
} from "../../api/loadPortal";
import { EscrowsForAddr } from "../../model/Escrow";
import { Orderbook } from "../../model/Orderbook";
import { PortalParams } from "../../model/PortalParams";
import ViewContractLink from "../components/ViewContractLink";
import EscrowTable from "./EscrowTable";
import { ModalInfo } from "./exchangeActions";
import {
  AskModal,
  BidModal,
  BuyModal,
  CancelModal,
  PleaseConnectModal,
  ProveModal,
  SellModal,
  SlashModal,
} from "./exchangeModals";
import OrdersTable from "./OrdersTable";

interface ExchangeProps {
  portal: Portal;
  connectedAddress?: string;
  addRecentTransaction: (tx: NewTransaction) => void;
}

interface ExchangeState {
  modal: ModalInfo;
  params?: PortalParams;
  orders?: Orderbook;
  escrow?: EscrowsForAddr;
}

export default class Exchange extends React.PureComponent<ExchangeProps> {
  state = {
    modal: { type: "none" },
  } as ExchangeState;

  _reloadInterval = 0;

  /** Load data + reload periodically. */
  componentDidMount() {
    console.log("Loading Portal parameters...");
    const { portal } = this.props;
    loadParams(portal)
      .then((params) => this.setState({ params }))
      .catch(console.error);

    this._reloadInterval = window.setInterval(this.reloadData, 10_000);
    this.reloadData();
  }

  componentWillUnmount() {
    window.clearInterval(this._reloadInterval);
  }

  /** Reloads the orderbook and open escrows. */
  reloadData = async () => {
    const { portal, connectedAddress } = this.props;

    console.log("Loading orderbook...");
    loadOrderbook(portal)
      .then((orders) => this.setState({ orders }))
      .catch(console.error);
    if (connectedAddress) {
      loadEscrowForAddr(connectedAddress, portal)
        .then((escrow) => this.setState({ escrow }))
        .catch(console.error);
    } else {
      this.setState({ escrow: undefined });
    }
  };

  /** Dispatch all actions thru a dispatcher. Like Redux, but simple. */
  dispatch = (modal: ModalInfo) => {
    // TODO: proper action dispatcher.
    console.log(`Dispatch: ${JSON.stringify(modal)}`);
    if (modal.type !== "none" && !this.props.connectedAddress) {
      modal = { type: "please-connect" };
    }
    this.setState({ modal });
    if (modal.type === "none") this.reloadData();
  };

  closeModal = () => this.dispatch({ type: "none" });

  render() {
    const { portal, addRecentTransaction } = this.props;
    const { params, orders, escrow, modal } = this.state;
    if (params == null) return null;
    const { ethNetwork, contractAddr } = params;

    const bbo = orders ? orders.getBestBidAsk() : [];
    const onClose = this.closeModal;
    const props = { portal, params, bbo, addRecentTransaction, onClose };

    return (
      <div>
        <h2>
          Orderbook{" "}
          <small>
            <ViewContractLink network={ethNetwork} contract={contractAddr} />
          </small>
        </h2>
        <OrdersTable orders={orders} params={params} dispatch={this.dispatch} />
        <EscrowTable escrow={escrow} params={params} dispatch={this.dispatch} />
        {modal.type === "please-connect" && <PleaseConnectModal {...props} />}
        {modal.type === "bid" && <BidModal {...props} />}
        {modal.type === "ask" && <AskModal {...props} />}
        {modal.type === "buy" && <BuyModal {...props} order={modal.order} />}
        {modal.type === "sell" && <SellModal {...props} order={modal.order} />}
        {modal.type === "cancel" && (
          <CancelModal {...props} order={modal.order} />
        )}
        {modal.type === "prove" && (
          <ProveModal {...props} escrow={modal.escrow} />
        )}
        {modal.type === "slash" && (
          <SlashModal {...props} escrow={modal.escrow} />
        )}
      </div>
    );
  }
}
