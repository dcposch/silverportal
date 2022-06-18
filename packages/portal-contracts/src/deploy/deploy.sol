// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "btcmirror/BtcMirror.sol";
import "btcmirror/BtcTxVerifier.sol";
import "../Portal.sol";

contract PortalDeploy is Test {
    function run(bool mainnet) public {
        vm.startBroadcast();

        // DEPLOY MIRROR
        BtcMirror mirror;
        if (mainnet) {
            // ...STARTING AT MAINNET BLOCK 739000
            mirror = new BtcMirror(
                739000,
                hex"00000000000000000001059a330a05e66e4fa2d1a5adcd56d1bfefc5c114195d",
                1654182075,
                0x96A200000000000000000000000000000000000000000,
                false
            );
        } else {
            // ...STARTING AT TESTNET BLOCK 2280126
            mirror = new BtcMirror(
                2280126,
                hex"00000000000000c551946ad9debb5f2fcbe3113d4f5cd8f54a05f1fac260a1bc",
                1655542950,
                0xEAB80000000000000000000000000000000000000000000000,
                true
            );
        }

        // DEPLOY VERIFIER
        BtcTxVerifier verifier = new BtcTxVerifier(mirror);

        // DEPLOY PORTAL
        new Portal(5, verifier);

        vm.stopBroadcast();
    }
}
