// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "../Portal.sol";
import "btcmirror/interfaces/IBtcTxVerifier.sol";

contract PortalTest is Test {
    event OrderPlaced(
        uint256 orderID,
        int128 amountSats,
        uint128 priceWeiPerSat,
        uint256 makerStakedWei,
        address maker
    );

    event OrderCancelled(uint256 orderID);

    event OrderMatched(
        uint256 escrowID,
        uint256 orderID,
        int128 amountSats,
        uint128 priceWeiPerSat,
        uint256 takerStakedWei,
        address maker,
        address taker
    );

    event EscrowSettled(
        uint256 escrowID,
        uint256 amountSats,
        address ethDest,
        uint256 ethAmount
    );

    event EscrowSlashed(
        uint256 escrowID,
        uint256 escrowDeadline,
        address ethDest,
        uint256 ethAmount
    );

    event ParamUpdated(uint256 oldVal, uint256 newVal, string name);

    function testSetParam() public {
        // Create a new Portal. Verify default params.
        Portal p = new Portal(5, IBtcTxVerifier(address(23)));
        assertEq(p.stakePercent(), 5);
        assertEq(p.minConfirmations(), 1);
        assertEq(address(p.btcVerifier()), address(23));
        assertEq(address(p.owner()), address(this));

        // Ensure we can set every parameter.
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

    function testBid() public returns (Portal p) {
        p = new Portal(5, IBtcTxVerifier(address(0)));

        // Test a successful bid
        uint256 stakeWei = 1 ether; /* 1 ETH = 5% of 1 * 20 ETH */
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(1, 1e8, 20e10, 1e18, address(this));
        uint256 orderId = p.postBid{value: stakeWei}(
            1e8, /* 1 BTC */
            20e10 /* 20 ETH/BTC */
        );
        assertEq(orderId, 1);

        // Test invalid bids
        vm.expectRevert(bytes("Incorrect stake"));
        p.postBid{value: 9e17}(1e8, 20e10);

        vm.expectRevert(bytes("Amount overflow"));
        p.postBid{value: stakeWei}(22e6 * 1e8, 20e10);

        vm.expectRevert(bytes("Price overflow"));
        p.postBid{value: stakeWei}(1e8, 20e20);

        vm.expectRevert(bytes("Amount underflow"));
        p.postBid{value: stakeWei}(0, 20e10);

        vm.expectRevert(bytes("Price underflow"));
        p.postBid{value: stakeWei}(1e8, 0);
    }

    function testAsk() public {}

    function testBuy() public {}

    function testSell() public returns (Portal p) {
        p = testBid();

        // Hit the bid. Buy 1 BTC for 20 ETH.
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Invalid bids first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateSell(orderID, 1e8, destScriptHash);

        vm.expectRevert(bytes("Amount incorrect"));
        p.initiateSell(orderID, 9e7, destScriptHash);

        // Valid bid
        address alice = address(this);
        address bob = address(this); // TODO
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(1e9, orderID, 1e8, 20e10, 0, alice, bob);
        uint256 escrowID = p.initiateSell{value: 20 ether}(
            orderID,
            1e8,
            destScriptHash
        );
        assertEq(escrowID, 1e9);

        // Try again. Bid should be filled now.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 20 ether}(orderID, 1e8, destScriptHash);
    }

    function testCancel() public {}

    function testSettle() public {}

    function testSlash() public {}
}

contract StubBtcTxVerifier is IBtcTxVerifier {
    bool alwaysBet;

    constructor(bool _alwaysBet) {
        alwaysBet = _alwaysBet;
    }

    function verifyPayment(
        uint256 minConfirmations,
        uint256 blockNum,
        BtcTxProof calldata inclusionProof,
        uint256 txOutIx,
        bytes20 destScriptHash,
        uint256 amountSats
    ) external view returns (bool) {
        return true;
    }
}
