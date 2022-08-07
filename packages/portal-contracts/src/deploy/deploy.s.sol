// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "btcmirror/BtcMirror.sol";
import "btcmirror/BtcTxVerifier.sol";
import "../Portal.sol";

contract PortalDeploy is Script {
    function run(bool mainnet, IERC20 token, BtcMirror existingMirror)
       external 
    {
        vm.startBroadcast();

        // DEPLOY MIRROR
        BtcMirror mirror;
	if (address(existingMirror) != address(0)) {
		mirror = existingMirror;
	} else if (mainnet) {
            // ...STARTING AT MAINNET BLOCK 739000
            mirror = new BtcMirror(
                739000,
                hex"00000000000000000001059a330a05e66e4fa2d1a5adcd56d1bfefc5c114195d",
                1654182075,
                0x96A200000000000000000000000000000000000000000,
                false
            );
        } else {
            // ...STARTING AT TESTNET BLOCK 2315360
            mirror = new BtcMirror(
                2315360,
                hex"0000000000000022201eee4f82ca053dfbc50d91e76e9cbff671699646d0982c",
                1659901500,
                0x000000000000003723C000000000000000000000000000000000000000000000,
                true
            );
        }

        // DEPLOY VERIFIER
        BtcTxVerifier verifier = new BtcTxVerifier(mirror);

        // DEPLOY PORTAL
        new Portal(token, 5, verifier);

        vm.stopBroadcast();
    }
}
