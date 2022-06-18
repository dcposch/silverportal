import "./PageProveTx.css";

import { getAddressInfo } from "bitcoin-address-validation";
import { ethers } from "ethers";
import * as React from "react";
import { factories } from "../../../types/ethers-contracts";
import { createGetblockClient } from "../../utils/bitcoin-rpc-client";
import { createBtcPaymentProof } from "../../utils/prove-bitcoin-tx";
import ViewContractLink from "../components/ViewContractLink";
import { parseBitcoinAddr } from "../../utils/bitcoin-addr";
import { Buffer } from "buffer";
import { contractAddrs } from "../../utils/constants";

const contractAddr = contractAddrs.btcTxVerifier;

export default class PageProveTx extends React.PureComponent {
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
    const parsed = parseBitcoinAddr(destAddr);
    if (!parsed.supported) {
      print(`⚠️ Unsupported address type`);
      return;
    }

    const scriptHash = Buffer.from(parsed.scriptHash).toString("hex");
    const txProof = await createBtcPaymentProof(this._btcRpc, txID, scriptHash);
    print(`Proof: ${JSON.stringify(txProof.inclusionProof, null, 2)}`);

    const paidBtc = (txProof.amountSats / 1e8).toFixed(8);
    print(`Payment: ${paidBtc} BTC to ${destAddr}`);

    const { payment } = txProof;
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
    const etherscanDomain =
      network === "mainnet" ? "etherscan.io" : `${network}.etherscan.io`;
    print(`https://${etherscanDomain}/address/${contractAddr}`);

    const provider = ethers.getDefaultProvider(network);
    const ver = factories.BtcTxVerifier__factory.connect(
      contractAddr,
      provider
    );
    try {
      const result = await ver.functions.verifyPayment(
        1,
        txProof.blockNum,
        txProof.inclusionProof,
        txProof.txOutIx,
        "0x" + destHash,
        txProof.amountSats
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
            <div className="provetx-form-row">
              <input
                ref={this._destAddr}
                defaultValue="2NFHjeqNQf5W24zq9YAP4CgzP42S8VcqXQF"
              ></input>
              <button onClick={this.validateAddr}>Validate</button>
            </div>
            <pre className="provetx-output">{this.state.outputAddr}</pre>
          </li>
          <li>
            <h3>Prove a Bitcoin payment to that address.</h3>
            <div>
              <ViewContractLink contract={contractAddr} network="ropsten" />
            </div>
            <label>Enter transaction ID:</label>
            <div className="provetx-form-row">
              <input
                ref={this._txID}
                defaultValue="cdc6c49f85c9980b3a2ee5f864c449ed0cf5804851cffe0d0eeb25ee166ee014"
              ></input>
              <button onClick={this.proveTx}>Prove</button>
            </div>
            <pre className="provetx-output">{this.state.outputTx}</pre>
          </li>
        </ol>
      </div>
    );
  }
}
