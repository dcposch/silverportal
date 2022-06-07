import { ethers } from "ethers";
import { factories } from "../../types/ethers-contracts";

import { getMerkleRoot, getProof } from "bitcoin-proof";
import {
  BitcoinJsonRpc,
  createGetblockClient,
  getBlock,
  getBlockCount,
  getBlockHash,
  getBlockHeader,
  getRawTransaction,
} from "../utils/bitcoin-rpc-client";
import { RpcClient } from "jsonrpc-ts";
import { BtcTxProofStruct } from "../../types/ethers-contracts/BtcTxVerifier";

main()
  .then(() => {})
  .catch((e) => console.log(e));

async function main() {
  const btcRpc = createGetblockClient();
  console.log(`Connected to Bitcoin RPC: ${btcRpc["options"].url}`);

  const latestHeight = await getBlockCount(btcRpc);
  console.log(`Latest block height: ${latestHeight}`);

  // Create a complete inclusion proof for transaction 13cd... in block 739000.
  console.log("Loading and proving Bitcoin payment...");
  const blockNum = 739000;
  const txId =
    "13cd6e3ae96a85bb567a681fbb339719d030cf7d8936cdfc6803069b42774052";
  const inclusionProof = await createInclusionProof(btcRpc, blockNum, txId);
  const txOutIx = 1;
  const destScriptHash = "ae2f3d4b06579b62574d6178c10c882b91503740";
  const amountSats = 25200000;

  console.log("Verifying payment on-chain, on Ethereum...");
  const provider = ethers.getDefaultProvider("ropsten");
  const ver = factories.BtcTxVerifier__factory.connect("0xTODO", provider);
  const result = await ver.functions.verifyPayment(
    1,
    blockNum,
    inclusionProof,
    txOutIx,
    destScriptHash,
    amountSats
  );

  console.log(`Done. Result: ${result[0]}`);
}

async function createInclusionProof(
  btcRpc: RpcClient<BitcoinJsonRpc>,
  blockNum: number,
  txId: string
): Promise<BtcTxProofStruct> {
  const blockHash = await getBlockHash(btcRpc, blockNum);
  const blockHeader = await getBlockHeader(btcRpc, blockHash);
  console.log(`Raw block ${blockNum}: ${blockHeader}`);

  const rawTx = await getRawTransaction(btcRpc, txId, blockHash);
  console.log(`Raw tx ${blockNum} ${txId.substring(0, 5)}…: ${rawTx}`);

  const { hash, height, merkleroot, tx } = await getBlock(btcRpc, blockHash);
  assertEqual(blockNum, height);
  assertEqual(blockHash, hash);
  const calcTxRoot = getMerkleRoot(tx);
  assertEqual(calcTxRoot, merkleroot);

  const txIndex = tx.indexOf(txId);
  if (txIndex < 0) throw new Error(`Transaction not found: ${txId}`);

  const txMerkleProof = getProof(tx, txIndex);

  return {
    blockHeader,
    rawTx,
    txId,
    txIndex,
    txMerkleProof,
  };
}

function assertEqual(a: any, b: any) {
  if (a !== b) throw new Error(`Mismatch ${a} ${b}`);
}
