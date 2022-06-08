import { ethers } from "ethers";
import { factories } from "../../types/ethers-contracts";
import {
  createGetblockClient,
  getBlockCount,
} from "../utils/bitcoin-rpc-client";
import { createBtcTransactionProof } from "../utils/prove-bitcoin-tx";

main()
  .then(() => {})
  .catch((e) => console.log(e));

async function main() {
  const btcRpc = createGetblockClient();
  console.log(`Connected to Bitcoin RPC: ${btcRpc["options"].url}`);

  const latestHeight = await getBlockCount(btcRpc);
  console.log(`Latest block height: ${latestHeight}`);

  // Create a complete inclusion proof for transaction 13cd... in block 739000.
  console.log("\nLoading and proving Bitcoin payment...");
  const id = "13cd6e3ae96a85bb567a681fbb339719d030cf7d8936cdfc6803069b42774052";
  const txProof = await createBtcTransactionProof(btcRpc, id);
  const txOutIx = 1;
  const destScriptHash = "ae2f3d4b06579b62574d6178c10c882b91503740";
  const amountSats = 25200000;
  console.log(JSON.stringify(txProof.inclusionProof, null, 2));

  console.log("\nVerifying payment on-chain, on Ethereum...");
  const provider = ethers.getDefaultProvider("ropsten");
  const ver = factories.BtcTxVerifier__factory.connect(
    "0x9dbec35ee0248be70b51a01f64d062f0af813f6f",
    provider
  );
  const result = await ver.functions.verifyPayment(
    1,
    739000,
    txProof.inclusionProof,
    txOutIx,
    "0x" + destScriptHash,
    amountSats
  );

  console.log(`Done. Result: ${result[0]}`);
}
