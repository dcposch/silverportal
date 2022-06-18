import { base58_to_binary, binary_to_base58 } from "base58-js";
import {
  AddressType,
  getAddressInfo,
  Network,
} from "bitcoin-address-validation";
import { Buffer } from "buffer";
import { createHash } from "sha256-uint8array";

const sha256 = (payload: Uint8Array) => createHash().update(payload).digest();

export interface ParsedBitcoinAddr {
  supported: boolean;
  network: Network;
  type: AddressType;
  bech32: boolean;
  scriptHash: Uint8Array;
}

/** Parses a Bitcoin address. For supported addresses, shows scripthash. */
export function parseBitcoinAddr(addr: string): ParsedBitcoinAddr {
  const info = getAddressInfo(addr);
  const ret: ParsedBitcoinAddr = {
    supported: info.type === "p2sh" && !info.bech32,
    network: info.network,
    type: info.type,
    bech32: info.bech32,
    scriptHash: new Uint8Array(),
  };

  if (ret.supported) {
    const bytes = base58_to_binary(addr);
    ret.scriptHash = bytes.slice(1, bytes.length - 4);
    // ret.scriptHash = Buffer.from(scriptHash).toString("hex");
  }

  return ret;
}

/** Formats a Bitcoin P2SH address. */
export function formatBitcoinAddr(
  destScriptHash: string,
  network: "mainnet" | "testnet"
) {
  const buf = Buffer.from(strip0x(destScriptHash), "hex");
  if (buf.length !== 20) throw new Error("Script hash must be 20 bytes");

  const addrTypeByte = network === "mainnet" ? 0x05 : 0xc4;
  const toHash = Buffer.concat([Buffer.from([addrTypeByte]), buf]);
  const checksum = sha256(sha256(toHash)).slice(0, 4);

  const addrBytes = Buffer.concat([toHash, checksum]);
  const addr = binary_to_base58(addrBytes);

  return addr;
}

/** Strips leading 0x from a hex string, if present. */
export function strip0x(hex: string): string {
  if (hex.startsWith("0x")) return hex.substring(2);
  return hex;
}
