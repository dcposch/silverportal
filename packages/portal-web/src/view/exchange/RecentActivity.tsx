import { Log } from "@ethersproject/providers";
import { BigNumber, ethers, providers } from "ethers";
import { LogDescription } from "ethers/lib/utils";
import * as React from "react";
import { PureComponent } from "react";
import { Portal, Portal__factory } from "../../../types/ethers-contracts";
import { PortalParams } from "../../model/PortalParams";
import { toFloat64 } from "../../utils/math";
import Amount from "../components/Amount";
import EthAddr from "../components/EthAddr";

interface RecentActivityProps {
  portal: Portal;
  params: PortalParams;
}

interface LogPlusDesc {
  approxAge: number;
  log: Log;
  desc: LogDescription;
}

type EventRenderer = (props: { log: LogPlusDesc }) => React.ReactElement;

const logRenderers: { [name: string]: EventRenderer } = {
  EscrowSettled: EscrowSettledRow,
  EscrowSlashed: EscrowSlashedRow,
  OrderCancelled: OrderCancelledRow,
  OrderMatched: OrderMatchedRow,
  OrderPlaced: OrderPlacedRow,
};

const BLOCK_TIME = 12;

/**
 * Show recent activity.
 * TODO: this requires fixing a bug in the contract for nonzero log data.
 */
export default class RecentActivity extends PureComponent<RecentActivityProps> {
  state = {
    logs: [] as LogPlusDesc[],
  };

  _interval = 0;

  componentDidMount() {
    this.loadActivity();
    this._interval = window.setInterval(this.loadActivity, 15000);
  }

  componentWillUnmount(): void {
    window.clearInterval(this._interval);
  }

  loadActivity = async () => {
    console.log("Loading recent activity...");
    const { portal } = this.props;

    const now = await portal.provider.getBlockNumber();
    const tMinus12H = now - 12 * 60 * 5;
    const rawLogs = await portal.provider.getLogs({
      address: portal.address,
      fromBlock: tMinus12H,
      toBlock: now,
    });
    const logs = rawLogs
      .map((l) => {
        const approxAge = (now - l.blockNumber) * BLOCK_TIME;

        try {
          return {
            log: l,
            desc: portal.interface.parseLog(l),
            approxAge,
          };
        } catch (e) {
          return null;
        }
      })
      .filter((l) => !!l) as LogPlusDesc[];
    console.log("Loaded logs", logs);
    this.setState({ logs });
  };

  render() {
    return (
      <div>
        {this.state.logs.map((log, i) => {
          const Renderer = logRenderers[log.desc.name];
          if (Renderer == null) return null;
          return <Renderer key={i} log={log} />;
        })}
      </div>
    );
  }
}

function EscrowSettledRow({ log }: { log: LogPlusDesc }) {
  return (
    <div className="exchange-activity-row">
      <strong>Settle</strong>
      <div>{formatApproxAge(log.approxAge)}</div>
      <div>
        <EthAddr link addr={log.desc.args[2]} /> proved a{" "}
        <Amount n={log.desc.args[1]} type="sats" /> payment
      </div>
    </div>
  );
}

function EscrowSlashedRow({ log }: { log: LogPlusDesc }) {
  return (
    <div className="exchange-activity-row">
      <strong>Slash</strong>
      <div>{formatApproxAge(log.approxAge)}</div>
      <div>
        <EthAddr link addr={log.desc.args[2]} /> claimed{" "}
        <Amount n={log.desc.args[3]} type="wei" />. Counterparty failed to pay.
      </div>
    </div>
  );
}

function OrderCancelledRow({ log }: { log: LogPlusDesc }) {
  return (
    <div className="exchange-activity-row">
      <strong>Cancel</strong>
      <div>{formatApproxAge(log.approxAge)}</div>
      <div>Order {log.desc.args[0]} cancelled.</div>
    </div>
  );
}

function OrderMatchedRow({ log }: { log: LogPlusDesc }) {
  const amountSats = log.desc.args[2] as BigNumber;
  const priceTokPerSat = log.desc.args[3] as BigNumber;
  const price = (1e10 / toFloat64(priceTokPerSat)).toFixed(4);
  const type = amountSats.isNegative() ? "Bought" : "Sold";
  const totalWei = toFloat64(amountSats.mul(priceTokPerSat));
  const orderID = log.desc.args[1].toNumber();

  return (
    <div className="exchange-activity-row">
      <strong>Trade</strong>
      <div>{formatApproxAge(log.approxAge)}</div>
      <div>
        Order {orderID} filled. {type} <Amount n={totalWei} type="wei" /> @{" "}
        {price}.
      </div>
    </div>
  );
}

function OrderPlacedRow({ log }: { log: LogPlusDesc }) {
  return (
    <div>
      <strong>BidAsk</strong>
    </div>
  );
}

/** Displays the approximate age of an event, given approximate seconds. */
function formatApproxAge(approxAge: number) {
  if (approxAge < 60) return "just now";
  if (approxAge < 3600) return `~${(approxAge / 60) | 0}m ago`;
  return `~${(approxAge / 3600) | 0}h ago`;
}
