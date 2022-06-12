// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "../Portal.sol";
import "btcmirror/interfaces/IBtcTxVerifier.sol";

contract PortalTest is Test {
    function testBid() public {
        Portal p = new Portal(5, IBtcTxVerifier(address(0)));
        assertEq(p.stakePercent(), uint256(5));
    }
}
