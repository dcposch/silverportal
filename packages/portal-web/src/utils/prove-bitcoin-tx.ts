import { getMerkleRoot, getProof } from "bitcoin-proof";
import { RpcClient } from "jsonrpc-ts";
import { BtcTxProofStruct } from "../../types/ethers-contracts/BtcTxVerifier";
import {
  BitcoinJsonRpc,
  getTransaction,
  getBlock,
  getBlockHeader,
  TxJson,
} from "./bitcoin-rpc-client";

export interface BtcTxProofAndDetails {
  blockNum: number;
  transaction: TxJson;
  inclusionProof: BtcTxProofStruct;
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
  const witnessSectionBytes = 1 + witnesses.length + witnessBytes;

  const version = hex.substring(0, 8);
  const txIO = hex.substring(12, hex.length - 8 - 2 * witnessSectionBytes);
  const locktime = hex.substring(hex.length - 8);

  return version + txIO + locktime;
}
