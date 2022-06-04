// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBitcoinMirror {
    function verifyTransaction(
        uint256 blockNum,
        bytes calldata inclusionProof,
        bytes32 recipientScriptHash,
        uint256 amountSats
    ) external view returns (bool);
}
