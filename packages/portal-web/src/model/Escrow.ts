import { BigNumber } from "ethers";

/** All bitcoin payments owed by or to an account (Ethereum address). */
export class EscrowsForAddr {
  ethAddress: string;
  btcPaymentsOwedBy: Escrow[];
  btcPaymentsOwedTo: Escrow[];
}

/**
 * Represents a pending bitcoin payment.
 * If the payer fails to deliver, the payee can call time and slash them.
 */
export interface Escrow {
  escrowId: number;
  destScriptHash: string;
  amountSatsDue: BigNumber;
  deadline: number;
  escrowWei: BigNumber;
  successRecipient: string;
  timeoutRecipient: string;
}
