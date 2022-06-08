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
  const rawTx = await getTransaction(btcRpc, txId);
  console.log(`Raw tx ${txId.substring(0, 5)}…: ${rawTx.hex}`);

  const { height, merkleroot, tx } = await getBlock(btcRpc, rawTx.blockhash);
  const blockHeader = await getBlockHeader(btcRpc, rawTx.blockhash);
  console.log(`Found in block ${height}: ${blockHeader}`);
  const calcTxRoot = await getMerkleRoot(tx);
  assertEqual(calcTxRoot, merkleroot);

  const txIndex = tx.indexOf(txId);
  if (txIndex < 0) throw new Error(`Transaction not found: ${txId}`);

  const proof = await getProof(tx, txIndex);
  assertEqual(proof.txId, txId);
  assertEqual(proof.txIndex, txIndex);
  const txMerkleProof = proof.sibling.join("");

  return {
    blockNum: height,
    transaction: rawTx,
    inclusionProof: {
      blockHeader: "0x" + blockHeader,
      rawTx: "0x" + rawTx.hex,
      txId: "0x" + txId,
      txIndex,
      txMerkleProof: "0x" + txMerkleProof,
    },
  };
}

function assertEqual<T>(a: T, b: T) {
  if (a !== b) throw new Error(`Mismatch A: ${a} B: ${b}`);
}
