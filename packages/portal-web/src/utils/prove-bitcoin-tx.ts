import { getMerkleRoot, getProof } from "bitcoin-proof";
import { RpcClient } from "jsonrpc-ts";
import { BtcTxProofStruct } from "../../types/ethers-contracts/BtcTxVerifier";
import { strip0x } from "./bitcoin-addr";
import {
  BitcoinJsonRpc,
  getBlock,
  getBlockHeader,
  getTransaction,
  TxJson,
} from "./bitcoin-rpc-client";

export interface BtcTxProofAndDetails {
  blockNum: number;
  transaction: TxJson;
  inclusionProof: BtcTxProofStruct;
}

export type BtcPaymentProofAndDetails = BtcTxProofAndDetails & {
  txOutIx: number;
  amountSats: number;
  payment: {
    value: number;
    n: number;
    scriptPubKey: {
      type: string;
      hex: string;
      address: string;
    };
  };
};

/**
 * Proves that a specific payment (tx output) occured.
 */
export async function createBtcPaymentProof(
  btcRpc: RpcClient<BitcoinJsonRpc>,
  txId: string,
  destScriptHash: string
) {
  const txProof = await createBtcTransactionProof(btcRpc, txId);

  const expectedHex = `a914${strip0x(destScriptHash)}87`;
  const txOutIx = txProof.transaction.vout.findIndex(
    (txo) => txo.scriptPubKey.hex === expectedHex
  );
  if (txOutIx < 0) {
    console.log(txProof.transaction, expectedHex);
    throw new Error(`No transaction outputs found paying ${destScriptHash}`);
  }
  const payment = txProof.transaction.vout[txOutIx];

  // This looks sketchy, but should be OK. The max integer that can be losslessly
  // represented as a float64 is ~2^53. The largest possible Bitcoin payment,
  // (21 million * 100 million) satoshis, is less than that.
  const amountSats = Math.round(payment.value * 1e8);

  return Object.assign({}, txProof, { txOutIx, amountSats, payment });
}

/**
 * Queries the Bitcoin JSON RPC API to load data for a given transaction.
 * Constructs a proof that can be submitted to Silver Portal.
 */
export async function createBtcTransactionProof(
  btcRpc: RpcClient<BitcoinJsonRpc>,
  txId: string
): Promise<BtcTxProofAndDetails> {
  // Load transaction information
  const rawTx = await getTransaction(btcRpc, txId);
  console.log(`Raw tx ${txId.substring(0, 5)}…: ${rawTx.hex}`);

  // Load the block header that this transaction belongs to
  const { height, merkleroot, tx } = await getBlock(btcRpc, rawTx.blockhash);
  const blockHeader = await getBlockHeader(btcRpc, rawTx.blockhash);
  console.log(`Found in block ${height}: ${blockHeader}`);
  const calcTxRoot = await getMerkleRoot(tx);
  assertEqual(calcTxRoot, merkleroot);

  // Produce a Merkle proof showing that the transaction ID is in the block
  const txIndex = tx.indexOf(txId);
  if (txIndex < 0) throw new Error(`Transaction not found: ${txId}`);

  const proof = await getProof(tx, txIndex);
  assertEqual(proof.txId, txId);
  assertEqual(proof.txIndex, txIndex);
  const txMerkleProof = proof.sibling.join("");

  // Finally, find the preimage for the transaction ID (hash-serialized raw tx)
  const hashSerRawTx = excerptHashSerializedRawTx(rawTx);

  return {
    blockNum: height,
    transaction: rawTx,
    inclusionProof: {
      blockHeader: "0x" + blockHeader,
      rawTx: "0x" + hashSerRawTx,
      txId: "0x" + txId,
      txIndex,
      txMerkleProof: "0x" + txMerkleProof,
    },
  };
}

function assertEqual<T>(a: T, b: T) {
  if (a !== b) throw new Error(`Mismatch A: ${a} B: ${b}`);
}

function excerptHashSerializedRawTx(rawTx: TxJson): string {
  const { hex } = rawTx;

  const flags = hex.substring(8, 12);
  if (!flags.startsWith("00")) {
    // Old-format Bitcoin transactions. No flags, no witnesses, already good.
    return hex;
  }
  if (flags !== "0001") throw new Error("Invalid flags");

  // Segwit. Strip flags and witnesses to get the hash serialization format.
  const witnesses = [] as string[];
  rawTx.vin.forEach((v) => witnesses.push(...v.txinwitness));
  if (witnesses.length === 0) {
    throw new Error("Missing witnesses");
  }
  if (witnesses.find((w) => w.length / 2 >= 0xfd)) {
    throw new Error("Witness too long");
  }

  const witnessBytes = witnesses.reduce((n, wit) => n + wit.length / 2, 0);
  // 1 byte for # witnesses, n bytes for each witnesses' length, + witness bytes
  const witnessSectionBytes =
    rawTx.vin.length + witnesses.length + witnessBytes;
  console.log({ rawTx, witnesses, witnessBytes });

  const version = hex.substring(0, 8);
  const txIO = hex.substring(12, hex.length - 8 - 2 * witnessSectionBytes);
  const locktime = hex.substring(hex.length - 8);

  return version + txIO + locktime;
}
