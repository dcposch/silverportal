declare module "base58-js" {
  export function base58_to_binary(addr: string): Uint8Array;
  export function binary_to_base58(bytes: Uint8Array): string;
}
