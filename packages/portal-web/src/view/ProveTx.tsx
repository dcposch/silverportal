import { getAddressInfo } from "bitcoin-address-validation";
import { ethers } from "ethers";
import * as React from "react";
import { factories } from "../../types/ethers-contracts";
import { createGetblockClient } from "../utils/bitcoin-rpc-client";
import { createBtcTransactionProof } from "../utils/prove-bitcoin-tx";

export default class ProveTx extends React.PureComponent {
  _destAddr = React.createRef<HTMLInputElement>();
  _txID = React.createRef<HTMLInputElement>();
  _btcRpc = createGetblockClient(process.env.GBAPI);

  state = {
    outputAddr: "",
    outputTx: "",
  };

  constructor(props: {}) {
    super(props);
  }

  validateAddr = () => {
    let lines = [] as string[];
    const print = (line: string) => {
      lines.push(line);
      this.setState({ outputAddr: lines.join("\n") });
    };

    print("Validating...");

    const addr = this._destAddr.current.value;
    try {
      const info = getAddressInfo(addr);
      print(`Network: ${info.network}`);
      const okType = info.type === "p2sh";
      print(`Type   : ${info.type} ${okType ? "✅" : "❌"}`);
      const okBech = !info.bech32;
      print(`Bech32 : ${"" + info.bech32} ${okBech ? "✅" : "❌"}`);
      if (okType && okBech) {
        print("✅ This address can receive Silver Portal payments.");
      } else {
        print("❌ This address cannot receive Silver Portal payments.");
      }
    } catch (e) {
      print(e.message);
    }
  };

  proveTx = async () => {
    let lines = [] as string[];
    const print = (line: string) => {
      lines.push(line);
      this.setState({ outputTx: lines.join("\n") });
    };

    const txID = this._txID.current.value;
    const destAddr = this._destAddr.current.value;
    print(`Proving payment to ${destAddr}`);

    const txProof = await createBtcTransactionProof(this._btcRpc, txID);
    print(`Proof: ${JSON.stringify(txProof.inclusionProof, null, 2)}`);

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

    print(`Verifying proof via BtcTxVerifier contract...`);
    const network = "ropsten" as string;
    const contract = "0xc2c5be1c1bc04b13ed641cafb25094495c9e2dc0";
    const etherscanDomain =
      network === "mainnet" ? "etherscan.io" : `${network}.etherscan.io`;
    print(`https://${etherscanDomain}/address/${contract}`);

    const provider = ethers.getDefaultProvider(network);
    const ver = factories.BtcTxVerifier__factory.connect(contract, provider);
    try {
      const result = await ver.functions.verifyPayment(
        1,
        txProof.blockNum,
        txProof.inclusionProof,
        paymentIx,
        "0x" + destHash,
        sats
      );
      if (result[0] === true) print(`Verification successful ✅`);
      else print("Unreachable 💀");
    } catch (e) {
      print(`⚠️ ${e.message}`);
    }
  };

  render() {
    return (
      <div>
        <blockquote>
          <p>
            ⚠️ This demonstrates the hard part: eth verification of bitcoin
            payments.
          </p>
        </blockquote>
        <ol>
          <li>
            <h3>Check destination address compatibility.</h3>
            <label>Enter Bitcoin address:</label>
            <div className="form-row">
              <input
                ref={this._destAddr}
                defaultValue="3Ah6nRWvwfLGHvrLNa2VThrAiTzSHnXyxx"
              ></input>
              <button onClick={this.validateAddr}>Validate</button>
            </div>
            <pre>{this.state.outputAddr}</pre>
          </li>
          <li>
            <h3>Prove a Bitcoin payment to that address.</h3>
            <label>Enter transaction ID:</label>
            <div className="form-row">
              <input
                ref={this._txID}
                defaultValue="13cd6e3ae96a85bb567a681fbb339719d030cf7d8936cdfc6803069b42774052"
              ></input>
              <button onClick={this.proveTx}>Prove</button>
            </div>
            <pre>{this.state.outputTx}</pre>
          </li>
        </ol>
      </div>
    );
  }
}
