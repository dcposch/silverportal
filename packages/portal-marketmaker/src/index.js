const axios = require('axios');
const { ethers } = require("ethers");

const satsToBTC = 10**8;
const wbtcAddress = "0xBde8bB00A7eF67007A96945B3a3621177B615C44"
const wbtcAbi = [
	"function balanceOf(address) external view returns (uint256)",
	"function allocateTo(address,uint256)",
];
const portalAddress = "0xD7A15a7B9c09E5126aB4598601dF5935C7Ab4Bec"
const portalAbi = [
	"function cancelOrder(uint256)",
];
const ethRpcProvider = "https://ropsten.infura.io/v3/6f2cc3019abd4ffa8045a331fc47f3d4"
const privateKey = "0ccd0dfe2df9ae2c9e325fcb09f0bf2101eae834241a5812d81e015c7d539443"
const myAddress = "0xB1032F1330D3d4DB2Db412E34050482E2Fc756f1"
const maker = "0xb1032f1330d3d4db2db412e34050482e2fc756f1";
const status = "PENDING";
const ordersQuery = `{orders(maker: $maker, status: $status) {
  amountSats
  priceTokPerSat
}}`;

var bidSats = BigInt(0);
var askSats = BigInt(0);
var bidLiquidity = BigInt(0);
var askLiquidity = BigInt(0);

var myWbtcSats = BigInt(0);

const provider = new ethers.providers.JsonRpcProvider(ethRpcProvider);
const signer = new ethers.Wallet(privateKey, provider);

const portal = new ethers.Contract(portalAddress, portalAbi, provider);
const portalWithSigner = portal.connect(signer);

const wbtc = new ethers.Contract(wbtcAddress, wbtcAbi, provider);
const wbtcWithSigner = wbtc.connect(signer);

function handlePendingOrder(order) {
	var amountSats = BigInt(order.amountSats);
	var priceTokPerSat = BigInt(order.priceTokPerSat);
	if (amountSats > 0) {
		bidSats += amountSats
		bidLiquidity += amountSats * priceTokPerSat
	} else {
		askSats += amountSats
		askLiquidity += amountSats * priceTokPerSat
	}
}

async function loadPendingOrders() {
	await axios.post('https://api.thegraph.com/subgraphs/name/kahuang/silver-portal', JSON.stringify({
	    ordersQuery,
	    variables : { maker, status },
	  }), {
	  headers: {
	    'Content-Type': 'application/json',
	    'Accept': 'application/json',
	  }})
	  .then(r => r.data.data.orders.map(order => handlePendingOrder(order)));
}

function handlePendingEscrow(escrow) {
}

async function loadPendingEscrows() {
	await axios.post('https://api.thegraph.com/subgraphs/name/kahuang/silver-portal', JSON.stringify({
	    query,
	    variables : { maker, status },
	  }), {
	  headers: {
	    'Content-Type': 'application/json',
	    'Accept': 'application/json',
	  }})
	  .then(r => r.data.data.orders.map(order => handlePendingOrder(order)));
}

async function loadWBTCBalance() {
	const myWbtcBalance = (await wbtc.balanceOf(myAddress)).toBigInt();
	myWbtcSats = myWbtcBalance * satsToBTC; 
}

async function main() {
	await loadPendingOrders();
	console.log("bidSats: ", bidSats, " askSats: ", askSats, " bidLiquidity: ", bidLiquidity, " askLiquidity: ", askLiquidity);

	await loadWBTCBalance();
	console.log("My wbtc sats: ", myWbtcSats);



}

main()
