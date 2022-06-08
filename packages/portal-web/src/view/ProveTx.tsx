import { getAddressInfo } from "bitcoin-address-validation";
import { ethers } from "ethers";
import * as React from "react";
import { factories } from "../../types/ethers-contracts";
import { createGetblockClient } from "../utils/bitcoin-rpc-client";
import { createBtcTransactionProof } from "../utils/prove-bitcoin-tx";

export default class ProveTx extends React.PureComponent {
  _destAddr = React.createRef<HTMLInputElement>();
  _txID = React.createRef<HTMLInputElement>();
  _txDestAddr = React.createRef<HTMLInputElement>();
  _btcRpc = createGetblockClient(process.env.GBAPI);

  state = {
    outputAddr: "",
    outputTx: "",
  };

  constructor(props: {}) {
    super(props);
  }

  validateAddr = () => {
    let outputAddr = "Validating...\n";
    this.setState({ outputAddr });

    const addr = this._destAddr.current.value;
    const info = getAddressInfo(addr);

    outputAddr += JSON.stringify(info, null, 2) + "\n";
    this.setState({ outputAddr });
  };

  proveTx = async () => {
    let lines = [] as string[];
    const print = (line: string) => {
      lines.push(line);
      this.setState({ outputTx: lines.join("\n") });
    };

    const txID = this._txID.current.value;
    const destAddr = this._txDestAddr.current.value;
    print(`Proving Bitcoin tx ${txID.substring(0, 5)} pays ${destAddr}...`);

    const txProof = await createBtcTransactionProof(this._btcRpc, txID);
    print(`Proof: ${JSON.stringify(txProof, null, 2)}`);

    const paymentIx = txProof.transaction.vout.findIndex(
      (txo) => txo.scriptPubKey.address === destAddr
    );
    if (paymentIx < 0) {
      print(`⚠️ No transaction outputs found paying ${destAddr}`);
      return;
    }
    const payment = txProof.transaction.vout[paymentIx];

    // This looks sketchy, but should be OK. The max integer that can be losslessly
    // represented as a float64 is ~2^53. The largest possible Bitcoin payment,
    // (21 million * 100 million) satoshis, is less than that. TODO: verify
    // that this multiplication cannot cause an off-by-one-sat rounding error.
    const sats = Math.round(payment.value * 1e8);
    print(`Payment: ${payment.value.toFixed(8)} BTC to ${destAddr}`);

    if (payment.scriptPubKey.type !== "scripthash") {
      print(`⚠️ Require P2SH payment. Found ${payment.scriptPubKey.type}`);
      return;
    }
    const destScript = payment.scriptPubKey.hex;
    if (!/^a914[\da-f]{40}87$/.test(destScript)) {
      print(`⚠️ Require standard P2SH, found ${destScript}`);
      return;
    }
    const destHash = destScript.substring(4, 44);

    print(`Verifying proof via Ethereum contract...`);
    const provider = ethers.getDefaultProvider("ropsten");
    const ver = factories.BtcTxVerifier__factory.connect(
      "0x3157138d244ef09c12c3031e953910f9f2ae3286",
      provider
    );
    try {
      const result = await ver.functions.verifyPayment(
        1,
        txProof.blockNum,
        txProof.inclusionProof,
        paymentIx,
        "0x" + destHash,
        sats
      );
      print(`Verification result: ${result}`);
    } catch (e) {
      print(`⚠️ ${e.message}`);
    }
  };

  render() {
    return (
      <div>
        <div>
          <h3>1. Check destination address compatibility.</h3>
          <label>Enter Bitcoin address:</label>
          <input
            ref={this._destAddr}
            defaultValue="3Ah6nRWvwfLGHvrLNa2VThrAiTzSHnXyxx"
          ></input>
          <button onClick={this.validateAddr}>Validate</button>
          <div>⚠️ Important: do this BEFORE sending a payment.</div>
          <pre>{this.state.outputAddr}</pre>
        </div>
        <div>
          <h3>2. Prove a Bitcoin transaction.</h3>
          <label>Enter transaction ID:</label>
          <input
            ref={this._txID}
            defaultValue="13cd6e3ae96a85bb567a681fbb339719d030cf7d8936cdfc6803069b42774052"
          ></input>
          <label>Destination:</label>
          <input
            ref={this._txDestAddr}
            defaultValue="3Ah6nRWvwfLGHvrLNa2VThrAiTzSHnXyxx"
          ></input>
          <button onClick={this.proveTx}>Prove</button>
          <pre>{this.state.outputTx}</pre>
        </div>
      </div>
    );
  }
}
