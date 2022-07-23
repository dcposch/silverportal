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
    
    event OrderUpdated(
        uint256 orderID,
        int128 amountSats,
        uint256 makerStakedTok,
        address maker
    );

    event OrderCancelled(uint256 orderID);

    event OrderMatched(
        uint256 escrowID,
        uint256 orderID,
        int128 amountSats,
        int128 amountSatsFilled,
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

    IERC20 immutable ETH = IERC20(address(0x0));

    function testSetParam() public {
        // Create a new Portal. Verify default params.
        Portal p = new Portal(ETH, 5, IBtcTxVerifier(address(23)));
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

        // // Burn our ownership
        p.setOwner(address(0));
        assertEq(address(p.owner()), address(0));

        // // Ensure we can no longer set params
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setStakePercent(0);
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setMinConfirmations(0);
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setBtcVerifier(IBtcTxVerifier(address(0)));
    }

    function testBid() public returns (Portal p) {
        p = new Portal(ETH, 5, IBtcTxVerifier(address(0)));

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
        vm.expectRevert(bytes("Wrong payment"));
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

    function testAsk() public returns (Portal p) {
        p = new Portal(ETH, 5, IBtcTxVerifier(address(0)));
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Test a successful ask
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(1, -1e8, 20e10, 0, address(this));
        uint256 orderId = p.postAsk{value: 20 ether}(
            1e8,
            20e10, /* 20 ETH/BTC */
            destScriptHash
        );
        assertEq(orderId, 1);

        // Test invalid bids
        vm.expectRevert(bytes("Wrong payment"));
        p.postBid{value: 21 ether}(1e8, 20e10);

        vm.expectRevert(bytes("Amount overflow"));
        p.postBid{value: 20 ether}(22e6 * 1e8, 20e10);

        vm.expectRevert(bytes("Price overflow"));
        p.postBid{value: 20 ether}(1e8, 20e20);

        vm.expectRevert(bytes("Amount underflow"));
        p.postBid{value: 20 ether}(0, 20e10);

        vm.expectRevert(bytes("Price underflow"));
        p.postBid{value: 20 ether}(1e8, 0);
    }

    function testBuy() public returns (Portal p) {
        p = testAsk();

        // Hit the ask. Buy 1 BTC for 20 ETH.
        // uint256 orderID = 1;

        // Invalid buys first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateBuy(1, 1e8);

        // Then, do it right. Stake 5% = 1 ETH.
        uint256 escrowID = p.initiateBuy{value: 1 ether}(1, 1e8);
        assertEq(escrowID, 1);

        vm.expectRevert(bytes("Order already filled"));
        p.initiateBuy{value: 0.1 ether}(1, 1e7);
    }
    
    function testPartialBuy() public returns (Portal p) {
        p = testAsk();

        // Hit the ask. Buy 1 BTC for 20 ETH.
        // uint256 orderID = 1;

        // Invalid buys first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateBuy(1, 1e8);

        // Then, do it right. Stake 5% = 1 ETH.
        uint256 escrowID = p.initiateBuy{value: 0.1 ether}(1, 1e7);
        assertEq(escrowID, 1);

        // Fill out the rest of the order
        escrowID = p.initiateBuy{value: 0.9 ether}(1, 1e8-1e7);
        assertEq(escrowID, 2);

        // Order should be filled
        vm.expectRevert(bytes("Order already filled"));
        p.initiateBuy{value: 0.1 ether}(1, 1e7);
    }

    function testSell() public returns (Portal p) {
        p = testBid();

        // Hit the bid. Sell 1 BTC for 20 ETH.
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Invalid sells first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateSell(orderID, 1e8, destScriptHash);

        vm.expectRevert(bytes("Amount incorrect"));
        p.initiateSell(orderID, 9e23, destScriptHash);

        // Valid sell
        address alice = address(this);
        address bob = address(this);
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(1, orderID, 1e8, 1e8, 20e10, 0, alice, bob);
        uint256 escrowID = p.initiateSell{value: 20 ether}(
            orderID,
            1e8,
            destScriptHash
        );
        assertEq(escrowID, 1);

        // Try again. Bid should be filled now.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 20 ether}(orderID, 1e8, destScriptHash);
    }
    
    function testPartialSell() public returns (Portal p) {
        p = testBid();

        // Hit the bid. Sell 1 BTC for 20 ETH.
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Valid sell
        address alice = address(this);
        address bob = address(this);
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(1, orderID, 1e8, 1e7, 20e10, 0, alice, bob);
        uint256 escrowID = p.initiateSell{value: 2 ether}(
            orderID,
            1e7,
            destScriptHash
        );
        assertEq(escrowID, 1);

        // Take the rest of the order
        p.initiateSell{value: 18 ether}(orderID, 1e8-1e7, destScriptHash);

        // Try again. Bid should be filled now.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 20 ether}(orderID, 1e8, destScriptHash);
    }

    function testCancel() public {
        Portal p = testBid();

        vm.expectEmit(true, true, true, true);
        emit OrderCancelled(1);
        p.cancelOrder(1);

        vm.expectRevert(bytes("Order not found"));
        p.cancelOrder(1);
    }

    receive() external payable {
        console.log("Received mETH", msg.value / 1e15);
    }

    function testSettleFromSell() public {
        Portal p = testSell();
        BtcTxProof memory proof;

        // First, stub in an failed proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(false));
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 123, proof, 12);

        //  Prove settlement. Successful proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(true));
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e8, address(this), 21 ether);
        p.proveSettlement(1, 123, proof, 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 123, proof, 12);
    }
    
    function testPartialSettleFromSell() public {
        Portal p = testPartialSell();
        BtcTxProof memory proof;

        // First, stub in an failed proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(false));
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 123, proof, 12);

        //  Prove settlement. Successful proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(true));
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e7, address(this), 2.1 ether);
        p.proveSettlement(1, 123, proof, 12);
        
        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 123, proof, 12);
        
        // Fill the final escrow
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(2, 1e8-1e7, address(this), 18.9 ether);
        p.proveSettlement(2, 123, proof, 12);
    }

    function testSlash() public {
        Portal p = testSell();

        // We can't slash immediately
        vm.expectRevert(bytes("Too early"));
        p.slash(1);

        // ...or after 24 hours
        skip(3600 * 24);
        vm.expectRevert(bytes("Too early"));
        p.slash(1);
        uint256 tPlus24 = block.timestamp;

        // We can slash after 24 hours and 1 second
        skip(1);
        vm.expectEmit(true, true, true, true);
        emit EscrowSlashed(1, tPlus24, address(this), 21 ether);
        p.slash(1);
    }
    
    function testSettleFromBuy() public {
        Portal p = testBuy();
        BtcTxProof memory proof;

        // First, stub in an failed proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(false));
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 123, proof, 12);

        //  Prove settlement. Successful proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(true));
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e8, address(this), 21 ether);
        p.proveSettlement(1, 123, proof, 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 123, proof, 12);
    }
    
    function testPartialSettleFromBuy() public {
        Portal p = testPartialBuy();
        BtcTxProof memory proof;

        // First, stub in an failed proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(false));
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 123, proof, 12);

        //  Prove settlement. Successful proof validation.
        p.setBtcVerifier(new StubBtcTxVerifier(true));
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e7, address(this), 2.1 ether);
        p.proveSettlement(1, 123, proof, 12);
        
        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 123, proof, 12);
        
        // Fill the final escrow
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(2, 1e8-1e7, address(this), 18.9 ether);
        p.proveSettlement(2, 123, proof, 12);
    }
    
    function testUpdateOrderNotMaker() public {
        Portal p = testBid();
        vm.prank(address(0x42));
        vm.expectRevert(bytes("Order not yours"));
        p.updateOrder(1, 1e8);
    }

    function testUpdateBid() public {
        Portal p = testBid();
        
        uint256 stakeWei = 1 ether; /* 1 ETH = 5% of 1 * 20 ETH */
        vm.expectEmit(true, true, true, true);
        emit OrderUpdated(1, 2e8, 2e18, address(this));
        p.updateOrder{value: stakeWei}(1, 1e8);
        
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";
        uint256 escrowID = p.initiateSell{value: 40 ether}(
            orderID,
            2e8,
            destScriptHash
        );
        assertEq(escrowID, 1);
        
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 20 ether}(orderID, 1e8, destScriptHash);
    }
    
    function testUpdateAsk() public {
        Portal p = testAsk();
        
        vm.expectEmit(true, true, true, true);
        emit OrderUpdated(1, -2e8, 0, address(this));
        p.updateOrder{value: 20 ether}(1, -1e8);
        
        uint256 orderID = 1;
        uint256 escrowID = p.initiateBuy{value: 2 ether}(
            orderID,
            2e8
        );
        assertEq(escrowID, 1);
        
        vm.expectRevert(bytes("Order already filled"));
        p.initiateBuy{value: 20 ether}(orderID, 1e8);
    }
}

contract StubBtcTxVerifier is IBtcTxVerifier {
    bool alwaysBet;

    constructor(bool _alwaysBet) {
        alwaysBet = _alwaysBet;
    }

    function verifyPayment(
        uint256, /* minConfirmations */
        uint256, /* blockNum */
        BtcTxProof calldata, /* inclusionProof */
        uint256, /* txOutIx */
        bytes20, /* destScriptHash */
        uint256 /* amountSats */
    ) external view returns (bool) {
        return alwaysBet;
    }
}
