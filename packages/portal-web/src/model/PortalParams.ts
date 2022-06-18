/** Configures a Silver Portal deployment. */
export interface PortalParams {
  btcNetwork: "testnet" | "mainnet";
  ethNetwork: "ropsten" | "mainnet";
  contractAddr: string;
  stakePercent: number;
  btcMinConfirmations: number;
}

export const portalContractAddr = "0x797e00be8ea74f67982899f78d3cfc72bd91045a";
