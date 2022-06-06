// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "btcmirror/BtcMirror.sol";
import "btcmirror/BtcTxVerifier.sol";
import "../Portal.sol";

contract PortalDeploy is Test {
    function run() public {
        vm.startBroadcast();

        // DEPLOY MIRROR, STARTING AT BLOCK 739,000
        BtcMirror mirror = new BtcMirror(
            739000,
            hex"00000000000000000001059a330a05e66e4fa2d1a5adcd56d1bfefc5c114195d",
            1654182075,
            0x96A200000000000000000000000000000000000000000
        );

        // DEPLOY VERIFIER
        BtcTxVerifier verifier = new BtcTxVerifier(mirror);

        // DEPLOY PORTAL
        new Portal(5, verifier);

        vm.stopBroadcast();
    }
}
