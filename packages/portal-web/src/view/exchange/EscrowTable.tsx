import * as React from "react";
import { Escrow, EscrowsForAddr } from "../../model/Escrow";
import { PortalParams } from "../../model/PortalParams";
import Amount from "../components/Amount";
import { DispatchFn } from "./exchangeActions";

export default function EscrowTable({
  escrow,
  params,
  dispatch,
}: {
  escrow?: EscrowsForAddr;
  params: PortalParams;
  dispatch: DispatchFn;
}) {
  if (escrow == null) {
    return null;
  }
  if (escrow.btcPaymentsOwedBy.length + escrow.btcPaymentsOwedTo.length === 0) {
    return null;
  }

  const rowProps = { params, dispatch };

  return (
    <div>
      <h2>Your Bitcoin payments</h2>
      <div>
        {escrow.btcPaymentsOwedBy.map((e, i) => (
          <EscrowRow key={"by-" + i} dir="owedBy" escrow={e} {...rowProps} />
        ))}
        {escrow.btcPaymentsOwedTo.map((e, i) => (
          <EscrowRow key={"to-" + i} dir="owedTo" escrow={e} {...rowProps} />
        ))}
      </div>
    </div>
  );
}

interface EscrowRowProps {
  dir: "owedBy" | "owedTo";
  escrow: Escrow;
  params: PortalParams;
  dispatch: DispatchFn;
}

class EscrowRow extends React.PureComponent<EscrowRowProps> {
  prove = (e: React.MouseEvent) => {
    e.preventDefault();
    const { dispatch, escrow } = this.props;
    dispatch({ type: "prove", escrow });
  };

  slash = (e: React.MouseEvent) => {
    e.preventDefault();
    const { dispatch, escrow } = this.props;
    dispatch({ type: "slash", escrow });
  };

  render() {
    const { dir, escrow, params } = this.props;
    if (params == null) return null;

    const nowS = new Date().getTime() / 1e3;
    const remainingS = escrow.deadline - nowS;
    let due: string;
    if (remainingS >= 3600) {
      const remainingH = Math.floor(remainingS / 3600);
      due = `due in ${remainingH}h`;
    } else if (remainingS >= 0) {
      const remainingM = Math.floor(remainingS / 60);
      due = `due in ${remainingM}m`;
    } else {
      due = "overdue";
    }

    return (
      <div className="exchange-escrow-row">
        <div>{dir === "owedBy" ? "Sending" : "Receiving"}</div>
        <div>
          <Amount n={escrow.amountSatsDue} type="sats" />{" "}
        </div>
        <div>{due}</div>
        {dir === "owedBy" && (
          <a href="#" onClick={this.prove}>
            Prove
          </a>
        )}
        {dir === "owedTo" && remainingS < 0 && (
          <a href="#" onClick={this.slash}>
            Slash
          </a>
        )}
      </div>
    );
  }
}
