// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "btcmirror/BtcTxVerifier.sol";
import "../Portal.sol";

contract DeployPortal is Script {
    function run(bool mainnet, ERC20 token) external {
        vm.startBroadcast();

        uint256 minConfirmations;
        BtcTxVerifier verifier;
        if (mainnet) {
            minConfirmations = 6;
            verifier = BtcTxVerifier(address(0x0)); // TODO
        } else {
            minConfirmations = 1;
            verifier = BtcTxVerifier(address(0x0)); // TODO
        }

        // DEPLOY PORTAL
        new Portal(token, 5, verifier, minConfirmations);

        vm.stopBroadcast();
    }
}
