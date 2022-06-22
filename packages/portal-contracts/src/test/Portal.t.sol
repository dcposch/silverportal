// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "../Portal.sol";
import "btcmirror/interfaces/IBtcTxVerifier.sol";

contract PortalTest is Test {
    function testSetParam() public {
        // Create a new Portal. Verify default params.
        Portal p = new Portal(5, IBtcTxVerifier(address(23)));
        assertEq(p.stakePercent(), 5);
        assertEq(p.minConfirmations(), 1);
        assertEq(address(p.btcVerifier()), address(23));
        assertEq(address(p.owner()), address(this));

        // Ensure we can set every param.
        p.setStakePercent(7);
        assertEq(p.stakePercent(), 7);

        p.setMinConfirmations(5);
        assertEq(p.minConfirmations(), 5);

        p.setBtcVerifier(IBtcTxVerifier(address(123)));
        assertEq(address(p.btcVerifier()), address(123));

        // Burn our ownership
        p.renounceOwnership();
        assertEq(address(p.owner()), address(0));

        // Ensure we can no longer set params
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        p.setStakePercent(0);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        p.setMinConfirmations(0);
        vm.expectRevert(bytes("Ownable: caller is not the owner"));
        p.setBtcVerifier(IBtcTxVerifier(address(0)));
    }

    function testBid() public {
        Portal p = new Portal(5, IBtcTxVerifier(address(0)));
        assertEq(p.stakePercent(), uint256(5));
    }
}
