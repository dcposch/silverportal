/** Configures a Silver Portal deployment. */
export interface PortalParams {
  btcNetwork: "testnet" | "mainnet";
  ethNetwork: "ropsten" | "mainnet";
  contractAddr: string;
  stakePercent: number;
  btcMinConfirmations: number;
}
