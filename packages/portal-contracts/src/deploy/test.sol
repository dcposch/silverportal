// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

interface ILottery {
    function numberOfTickets() external view returns (uint256);
}

contract TestLottery is Test {
    function run() public {
        vm.startBroadcast();

        ILottery l = ILottery(
            address(0x8DE42dAE71A75203fBdb9C45eBC0e6E69206c5c5)
        );

        uint256 nTix = l.numberOfTickets();

        emit log_named_uint("Tickets", nTix);
    }
}
