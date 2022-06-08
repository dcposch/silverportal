import { RpcClient } from "jsonrpc-ts";

export interface BitcoinJsonRpc {
  getblockcount: [];
  getblockhash: [number];
  getblockheader: [string, boolean];
  getblock: [string, number];
  gettransaction: [string];
  getrawtransaction: [string, boolean, string | null];
  decoderawtransaction: [string, string];
}

export interface BlockJson {
  hash: string;
  height: number;
  merkleroot: string;
  nTx: number;
  tx: string[];
}

export interface TxJson {
  txid: string;
  hash: string;
  version: number;
  vout: {
    value: number;
    n: number;
    scriptPubKey: {
      type: string;
      hex: string;
      address: string;
    };
  }[];
  hex: string;
  blockhash: string;
}

export type BtcRpcClient = RpcClient<BitcoinJsonRpc>;

/**
 * Creates a Bitcoin client pointing to getblock.io
 */
export function createGetblockClient(
  apiKey?: String
): RpcClient<BitcoinJsonRpc> {
  if (!apiKey) {
    apiKey = process.env.GETBLOCK_API_KEY;
    if (!apiKey) throw new Error("Missing GETBLOCK_API_KEY & no apiKey passed");
  }

  return new RpcClient<BitcoinJsonRpc>({
    url: "https://btc.getblock.io/mainnet/",
    headers: { "x-api-key": apiKey },
  });
}

export async function getBlockHash(
  rpc: BtcRpcClient,
  height: number
): Promise<string> {
  let res = await rpc.makeRequest({
    method: "getblockhash",
    params: [height],
    jsonrpc: "2.0",
  });
  if (res.status !== 200) throw new Error("bad getblockhash: " + res);
  const blockHash = res.data.result as string;
  return blockHash;
}

export async function getBlockCount(rpc: BtcRpcClient) {
  const res = await rpc.makeRequest({
    method: "getblockcount",
    params: [],
    jsonrpc: "2.0",
  });
  if (res.status !== 200) throw new Error("bad getblockcount: " + res);
  return res.data.result as number;
}

export async function getBlockHeader(rpc: BtcRpcClient, blockHash: string) {
  const res = await rpc.makeRequest({
    method: "getblockheader",
    params: [blockHash, false],
    jsonrpc: "2.0",
  });
  if (res.status !== 200) throw new Error("bad getblockheader: " + res);
  const headerHex = res.data.result as string;
  return headerHex;
}

export async function getBlock(
  rpc: BtcRpcClient,
  blockHash: string
): Promise<BlockJson> {
  const res = await rpc.makeRequest({
    method: "getblock",
    params: [blockHash, 1],
    jsonrpc: "2.0",
  });
  if (res.status !== 200) throw new Error("bad getblock: " + res);
  return res.data.result as BlockJson;
}

export async function getTransaction(
  rpc: BtcRpcClient,
  txId: string
): Promise<TxJson> {
  const res = await rpc.makeRequest({
    method: "getrawtransaction",
    params: [txId, true, null],
    jsonrpc: "2.0",
  });
  if (res.status !== 200) throw new Error("bad getrawtransaction: " + res);
  const ret = res.data.result as TxJson;
  return ret;
}
