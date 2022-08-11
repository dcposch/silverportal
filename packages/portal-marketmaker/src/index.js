const axios = require("axios");
const { ethers } = require("ethers");
const bitcore = require("bitcore-lib");
const btcproof = require("bitcoin-proof");

// How many sats to 1 btc
const satsToBTC = 10 ** 8;
// Address of the wbtc contract on ropsten testnet
const wbtcAddress = "0xBde8bB00A7eF67007A96945B3a3621177B615C44";
// wbtc abi
const wbtcAbi = [
  "function balanceOf(address) external view returns (uint256)",
  "function allocateTo(address,uint256)",
];

// Portal contract address on ropsten
const portalAddress = "0xa909c8B6eD96899dFb82a698FEF380e8836e00b9";

// eth rpc provider
const ethRpcProvider =
  "https://ropsten.infura.io/v3/6f2cc3019abd4ffa8045a331fc47f3d4";
// eth pkey. Note: should load this from an environment variable or secret store!
const ethPrivateKey =
  "0ccd0dfe2df9ae2c9e325fcb09f0bf2101eae834241a5812d81e015c7d539443";
// eth address
const myEthAddress = "0xb1032f1330d3d4db2db412e34050482e2fc756f1";
// variables for graphql query.
const theGraphURL =
  "https://api.thegraph.com/subgraphs/name/kahuang/silver-portal";
const maker = "0xb1032f1330d3d4db2db412e34050482e2fc756f1";
const status = "PENDING";
const myOrdersQuery = `{orders(maker: $maker, status: $status) {
  amountSats
  priceTps
}}`;

/*
// orders that we want to fulfill because we can make money off them
const ordersToFulfill = `{orders(where: {maker_not_contains_nocase : $maker, amountSats_lt : 0, priceTps_gt : $minPrice}) {
	amountSats
	priceTps
}}`
const minPrice = 9950000000;
*/

const escrowsQuery = `{escrows(where : {successRecipient_contains: "0xb1032f1330d3d4db2db412e34050482e2fc756f1", status: "PENDING"}) {
	amountSatsDue
	destScriptHash
	deadline
	id
}_meta { block { number }}}`;

// btc address we'll use to fulfill escrows
const myBtcAddress = "mqHEJi3boWQHwo2x8fEpXejyDWj37yTtDG";
// btc private key.  Note: should load this from an environment variable or secret store!
const myBtcKey = "cNdotpEDrvEhCp7rABaent5cqnvrX9gGph3eL1PPQLt3AxmAwETh";
//const myBtcAddress = "0x529ccdd3112490bc59754892787e93f124520e78";

// How many sats we have in bid orders
var bidSats = BigInt(0);
// How many sats we have in ask orders.
var askSats = BigInt(0);
// How much liquidity we have in bids.
var bidLiquidity = BigInt(0);
// How much liquidity we have in asks.
var askLiquidity = BigInt(0);
// How many wbtc sats we have.
var myWbtcSats = BigInt(0);
// How many btc sats we have.
var myBTCSats = BigInt(0);

const portalJSONABI = `[{"inputs":[{"internalType":"contract IERC20","name":"_token","type":"address"},{"internalType":"uint256","name":"_stakePercent","type":"uint256"},{"internalType":"contract IBtcTxVerifier","name":"_btcVerifier","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"escrowID","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountSats","type":"uint256"},{"indexed":false,"internalType":"address","name":"ethDest","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"}],"name":"EscrowSettled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"escrowID","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"escrowDeadline","type":"uint256"},{"indexed":false,"internalType":"address","name":"ethDest","type":"address"},{"indexed":false,"internalType":"uint256","name":"ethAmount","type":"uint256"}],"name":"EscrowSlashed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderID","type":"uint256"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"escrowID","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":false,"internalType":"int128","name":"amountSats","type":"int128"},{"indexed":false,"internalType":"int128","name":"amountSatsFilled","type":"int128"},{"indexed":false,"internalType":"uint128","name":"priceTps","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"takerStakedTok","type":"uint256"},{"indexed":false,"internalType":"address","name":"maker","type":"address"},{"indexed":false,"internalType":"address","name":"taker","type":"address"}],"name":"OrderMatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"orderID","type":"uint256"},{"indexed":false,"internalType":"int128","name":"amountSats","type":"int128"},{"indexed":false,"internalType":"uint128","name":"priceTps","type":"uint128"},{"indexed":false,"internalType":"uint256","name":"makerStakedTok","type":"uint256"},{"indexed":false,"internalType":"address","name":"maker","type":"address"}],"name":"OrderPlaced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldVal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newVal","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"ParamUpdated","type":"event"},{"inputs":[],"name":"btcVerifier","outputs":[{"internalType":"contract IBtcTxVerifier","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderID","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"escrows","outputs":[{"internalType":"bytes20","name":"destScriptHash","type":"bytes20"},{"internalType":"uint128","name":"amountSatsDue","type":"uint128"},{"internalType":"uint128","name":"deadline","type":"uint128"},{"internalType":"uint256","name":"escrowTok","type":"uint256"},{"internalType":"address","name":"successRecipient","type":"address"},{"internalType":"address","name":"timeoutRecipient","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderID","type":"uint256"},{"internalType":"uint128","name":"amountSats","type":"uint128"}],"name":"initiateBuy","outputs":[{"internalType":"uint256","name":"escrowID","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderID","type":"uint256"},{"internalType":"uint128","name":"amountSats","type":"uint128"},{"internalType":"bytes20","name":"destScriptHash","type":"bytes20"}],"name":"initiateSell","outputs":[{"internalType":"uint256","name":"escrowID","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"minConfirmations","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextEscrowID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nextOrderID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"orderbook","outputs":[{"internalType":"address","name":"maker","type":"address"},{"internalType":"int128","name":"amountSats","type":"int128"},{"internalType":"uint128","name":"priceTps","type":"uint128"},{"internalType":"bytes20","name":"scriptHash","type":"bytes20"},{"internalType":"uint256","name":"stakedTok","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountSats","type":"uint256"},{"internalType":"uint256","name":"priceTps","type":"uint256"},{"internalType":"bytes20","name":"scriptHash","type":"bytes20"}],"name":"postAsk","outputs":[{"internalType":"uint256","name":"orderID","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountSats","type":"uint256"},{"internalType":"uint256","name":"priceTps","type":"uint256"}],"name":"postBid","outputs":[{"internalType":"uint256","name":"orderID","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"escrowID","type":"uint256"},{"internalType":"uint256","name":"bitcoinBlockNum","type":"uint256"},{"components":[{"internalType":"bytes","name":"blockHeader","type":"bytes"},{"internalType":"bytes32","name":"txId","type":"bytes32"},{"internalType":"uint256","name":"txIndex","type":"uint256"},{"internalType":"bytes","name":"txMerkleProof","type":"bytes"},{"internalType":"bytes","name":"rawTx","type":"bytes"}],"internalType":"struct BtcTxProof","name":"bitcoinTransactionProof","type":"tuple"},{"internalType":"uint256","name":"txOutIx","type":"uint256"}],"name":"proveSettlement","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IBtcTxVerifier","name":"_btcVerifier","type":"address"}],"name":"setBtcVerifier","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_minConfirmations","type":"uint256"}],"name":"setMinConfirmations","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_stakePercent","type":"uint256"}],"name":"setStakePercent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"escrowID","type":"uint256"}],"name":"slash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"stakePercent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}]`;

const provider = new ethers.providers.JsonRpcProvider(ethRpcProvider);
const signer = new ethers.Wallet(ethPrivateKey, provider);

const portal = new ethers.Contract(portalAddress, portalJSONABI, provider);
const portalWithSigner = portal.connect(signer);

const wbtc = new ethers.Contract(wbtcAddress, wbtcAbi, provider);
const wbtcWithSigner = wbtc.connect(signer);

// variable to keep track of which block we've queried in thegraph
var minblock = 0;

const getBlocksURL = "https://btc.getblock.io/testnet/";
const getBlocksAPIKey = "44befe46-b6d8-47c5-98bb-9f4579728cc9";

function handlePendingOrder(order) {
  var amountSats = BigInt(order.amountSats);
  var priceTps = BigInt(order.priceTps);
  if (amountSats > 0) {
    bidSats += amountSats;
    bidLiquidity += amountSats * priceTps;
  } else {
    askSats += amountSats;
    askLiquidity += amountSats * priceTps;
  }
}

async function loadPendingOrders() {
  await axios
    .post(
      theGraphURL,
      JSON.stringify({
        query: myOrdersQuery,
        variables: { maker, status },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    )
    .then((r) => r.data.data.orders.map((order) => handlePendingOrder(order)));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function handlePendingEscrows(escrows) {
  promises = [];
  for (var i = 0; i < escrows.length; i++) {
    escrow = escrows[i];
    console.log("Handling escrow: ", escrow);
    var buf = Buffer.from(strip0x(escrow.destScriptHash), "hex");
    var addr = bitcore.Address.fromScriptHash(
      buf,
      "testnet",
      "scripthash"
    ).toString();
    const amountSatsDue = parseInt(escrow.amountSatsDue);
    console.log("Sending ", amountSatsDue, " sats to ", addr);
    // This sends the tx to the mempool and returns the txid.
    const txid = (await sendBitcoin(addr, amountSatsDue)).txid;
    promises.push(proveSettlement(txid, escrow));
  }

  // Then wait for settlement for all inflight txs
  const p = Promise.all(promises);
}

// Proves the settlement of a bitcoin tx to the Portal contract.
async function proveSettlement(txid, escrow) {
  //const txid = 'ecc2ee194c359cc6577dadef1f96d5a71fceb1c3dbba4f72bfc86f43e72352c6';
  // wait for tx to make it to the mempool
  console.log("Sleeping for 15 seconds before handling txid: ", txid);
  await sleep(1000 * 15);
  const escrowID = parseInt(escrow.id);
  const destScriptHash = escrow.destScriptHash;

  var confirmations = -1;
  var rawTx;

  while (confirmations < 1) {
    rawTx = await getRawTransaction(txid);
    console.log(rawTx);
    if (rawTx.confirmations !== null && rawTx.confirmations !== undefined) {
      confirmations = rawTx.confirmations;
    }
    // Sleep 1 minutes
    console.log("Sleeping for 60 seconds while transaction gets confirmed...");
    await sleep(1000 * 60);
  }

  const block = await getBtcBlock(rawTx.blockhash);
  const blockHeader = await getBtcBlockHeader(rawTx.blockhash);
  const txIndex = block.tx.indexOf(txid);
  const proof = await btcproof.getProof(block.tx, txIndex);

  const txMerkleProof = proof.sibling.join("");
  const hashSerRawTx = excerptHashSerializedRawTx(rawTx);

  const expectedHex = `a914${strip0x(destScriptHash)}87`;
  const txOutIx = rawTx.vout.findIndex(
    (txo) => txo.scriptPubKey.hex == expectedHex
  );

  const btcProofStruct = {
    blockHeader: "0x" + blockHeader,
    txId: "0x" + txid,
    txIndex: txIndex,
    txMerkleProof: "0x" + txMerkleProof,
    rawTx: "0x" + hashSerRawTx,
  };

  console.log(btcProofStruct);

  // Sleep 5 minutes before submitting, to let the btcmirror catch up
  console.log("sleeping for 5 minutes to let btc mirror catch up");
  await sleep(1000 * 60 * 5);

  var res = await portalWithSigner.proveSettlement(
    escrowID,
    block.height,
    btcProofStruct,
    txOutIx
  );

  console.log(
    "Successfully proved settlement, sleeping for 1 minute to allow tx to propagate."
  );
  await sleep(1000 * 60);

  return;
}

async function loadAndHandlePendingEscrows() {
  const res = await axios.post(
    theGraphURL,
    JSON.stringify({
      query: escrowsQuery,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  console.log(res.data);

  var newMinBlock = res.data.data._meta.block.number;
  if (newMinBlock > minblock) {
    minblock = newMinBlock;
    console.log("new minblock ", minblock);
  } else {
    return;
  }

  const escrows = res.data.data.escrows;
  await handlePendingEscrows(escrows);
}

async function loadWBTCBalance() {
  const myWbtcBalance = (await wbtc.balanceOf(myEthAddress)).toBigInt();
  myWbtcSats = myWbtcBalance * BigInt(satsToBTC);
}

async function loadBTCBalance() {
  const utxos = await axios.get(
    `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
  );

  let totalAmountAvailable = 0;

  utxos.data.data.txs.forEach(async (element) => {
    totalAmountAvailable += Math.floor(Number(element.value) * 100000000);
  });

  return totalAmountAvailable;
}

// Sends amountSatsDue to receiverAddress. Returns after
// the tx is subimtted to the mempool, returning the txid.
async function sendBitcoin(receiverAddress, amountSatsDue) {
  const sochain_network = "BTCTEST";
  const privateKey = myBtcKey;
  const sourceAddress = myBtcAddress;

  let fee = 0;
  let inputCount = 0;
  let outputCount = 2;
  const utxos = await axios.get(
    `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
  );

  const transaction = new bitcore.Transaction();
  let totalAmountAvailable = 0;

  let inputs = [];
  utxos.data.data.txs.forEach(async (element) => {
    let utxo = {};
    utxo.satoshis = Math.floor(Number(element.value) * 100000000);
    utxo.script = element.script_hex;
    utxo.address = utxos.data.data.address;
    utxo.txId = element.txid;
    utxo.outputIndex = element.output_no;
    totalAmountAvailable += utxo.satoshis;
    inputCount += 1;
    inputs.push(utxo);
  });

  transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
  // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte

  fee = transactionSize * 1;
  if (totalAmountAvailable - amountSatsDue - fee < 0) {
    throw new Error("Balance is too low for this transaction");
  }

  //Set transaction input
  transaction.from(inputs);

  // set the recieving address and the amount to send
  transaction.to(receiverAddress, amountSatsDue);

  // Set change address - Address to receive the left over funds after transfer
  transaction.change(sourceAddress);

  //manually set transaction fees: 20 satoshis per byte
  transaction.fee(fee * 20);

  // Sign transaction with your private key
  transaction.sign(privateKey);

  // serialize Transactions
  const serializedTransaction = transaction.serialize();
  // Send transaction
  const result = await axios({
    method: "POST",
    url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
    data: {
      tx_hex: serializedTransaction,
    },
  });
  return result.data.data;
}

async function getBtcBlock(blockhash) {
  // Get the "bestblock" information
  res = await axios.post(
    getBlocksURL,
    JSON.stringify({
      jsonrpc: "2.0",
      method: "getblock",
      params: [blockhash, 1],
      id: "getblock.io",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": getBlocksAPIKey,
      },
    }
  );
  return res.data.result;
}

async function getBtcTxProof(txid) {
  res = await axios.post(
    getBlocksURL,
    JSON.stringify({
      jsonrpc: "2.0",
      method: "gettxoutproof",
      params: [[txid], null],
      id: "getblock.io",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": getBlocksAPIKey,
      },
    }
  );
  return res.data.result;
}

async function getBtcBlockHeader(blockhash) {
  res = await axios.post(
    getBlocksURL,
    JSON.stringify({
      jsonrpc: "2.0",
      method: "getblockheader",
      params: [blockhash, false],
      id: "getblock.io",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": getBlocksAPIKey,
      },
    }
  );
  return res.data.result;
}

async function getRawTransaction(txid) {
  res = await axios.post(
    getBlocksURL,
    JSON.stringify({
      jsonrpc: "2.0",
      method: "getrawtransaction",
      params: [txid, true, null],
      id: "getblock.io",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": getBlocksAPIKey,
      },
    }
  );
  return res.data.result;
}

// get the HashSeralized format of the bitcoin tx.
function excerptHashSerializedRawTx(rawTx) {
  const { hex } = rawTx;

  const flags = hex.substring(8, 12);
  if (!flags.startsWith("00")) {
    // Old-format Bitcoin transactions. No flags, no witnesses, already good.
    return hex;
  }
  if (flags !== "0001") throw new Error("Invalid flags");

  // Segwit. Strip flags and witnesses to get the hash serialization format.
  const witnesses = [];
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

function strip0x(hex) {
  if (hex.startsWith("0x")) return hex.substring(2);
  return hex;
}

// Poll at least once a minute
const escrowPollMillis = 1000 * 60;

async function escrowsLoop() {
  while (true) {
    var start = Date.now();
    await loadAndHandlePendingEscrows();
    var durationMillis = Date.now() - start;

    if (durationMillis < escrowPollMillis) {
      await sleep(escrowPollMillis - durationMillis);
    }
  }
}

async function main() {
  await loadPendingOrders();
  console.log(
    "bidSats: ",
    bidSats,
    " askSats: ",
    askSats,
    " bidLiquidity: ",
    bidLiquidity,
    " askLiquidity: ",
    askLiquidity
  );

  await loadWBTCBalance();
  console.log("My wbtc sats: ", myWbtcSats);

  // Launches the main loop of this worker which:
  // 1. Loads all pending escrows that our market maker bot needs to fulfill
  // 2. Sends bitcoin to the associated P2SH addresses
  // 3. Waits for those txs to hit minConfirmations (2 in this case)
  // 4. Proves that those payments have settled to the Portal contract, and receiving
  //    the WBTC from escrow.

  var eloop = escrowsLoop();
  await eloop;
}

main();
