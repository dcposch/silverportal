// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "btcmirror/BtcMirror.sol";
import "btcmirror/BtcTxVerifier.sol";
import "../Portal.sol";

contract PortalDeploy is Script {
    function run(
        bool mainnet,
        ERC20 token,
        BtcTxVerifier existingVerifier
    ) external {
        vm.startBroadcast();

        // DEPLOY MIRROR
        BtcTxVerifier verifier;
        if (address(existingVerifier) != address(0)) {
            verifier = existingVerifier;
        } else if (mainnet) {
            // ...STARTING AT MAINNET BLOCK 739000
            BtcMirror mirror = new BtcMirror(
                739000,
                hex"00000000000000000001059a330a05e66e4fa2d1a5adcd56d1bfefc5c114195d",
                1654182075,
                0x96A200000000000000000000000000000000000000000,
                false
            );
            verifier = new BtcTxVerifier(mirror);
        } else {
            // ...STARTING AT TESTNET BLOCK 2315360
            BtcMirror mirror = new BtcMirror(
                2315360,
                hex"0000000000000022201eee4f82ca053dfbc50d91e76e9cbff671699646d0982c",
                1659901500,
                0x000000000000003723C000000000000000000000000000000000000000000000,
                true
            );
            verifier = new BtcTxVerifier(mirror);
        }

        // DEPLOY PORTAL
        new Portal(token, 5, verifier);

        vm.stopBroadcast();
    }
}
