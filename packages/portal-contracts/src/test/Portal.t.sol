// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "../Portal.sol";
import "btcmirror/interfaces/IBtcMirror.sol";
import "btcmirror/interfaces/IBtcTxVerifier.sol";
import {console} from "forge-std/console.sol";

contract PortalTest is Test {
    event OrderPlaced(
        uint256 orderID,
        int128 amountSats,
        uint128 priceTps,
        uint256 makerStakedWei,
        address maker
    );

    event OrderCancelled(uint256 orderID);

    event OrderMatched(
        uint256 escrowID,
        uint256 orderID,
        int128 amountSats,
        int128 amountSatsFilled,
        uint128 priceTps,
        uint256 takerStakedWei,
        uint128 deadline,
        address maker,
        address taker,
        bytes20 destScriptHash
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
        uint256 ethAmounts
    );

    event ParamUpdated(uint256 oldVal, uint256 newVal, string name);

    ERC20 immutable ETH = ERC20(address(0x0));

    function testSetParam() public {
        // Create a new Portal. Verify default params.
        Portal p = new Portal(ETH, 5, IBtcTxVerifier(address(23)), 1);
        assertEq(p.stakePercent(), 5);
        assertEq(p.minConfirmations(), 1);
        assertEq(address(p.btcVerifier()), address(23));
        assertEq(address(p.owner()), address(this));

        // Ensure we can set every parameter.
        p.setStakePercent(7);
        assertEq(p.stakePercent(), 7);

        p.setMinOrderSats(5);
        assertEq(p.minOrderSats(), 5);

        p.setTickTps(100);
        assertEq(p.tickTps(), 100);

        // Burn our ownership
        p.setOwner(address(0));
        assertEq(address(p.owner()), address(0));

        // Ensure we can no longer set params
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setStakePercent(0);
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setMinOrderSats(25);
        vm.expectRevert(bytes("UNAUTHORIZED"));
        p.setTickTps(500);
    }

    function testAsk() public returns (Portal p) {
        p = new Portal(ETH, 5, new StubBtcTxVerifier(), 1);

        // Test a successful ask
        uint256 stakeWei = 1 ether; /* 1 ETH = 5% of 1 * 20 ETH */
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(1, 1e8, 20e10, 1e18, address(this));
        uint256 orderId = p.postAsk{value: stakeWei}(
            1e8, /* 1 BTC */
            20e10 /* 20 ETH/BTC */
        );
        assertEq(orderId, 1);

        // Test invalid asks
        vm.expectRevert(bytes("Wrong payment"));
        p.postAsk{value: 9e17}(1e8, 20e10);

        vm.expectRevert(bytes("Amount overflow"));
        p.postAsk{value: stakeWei}(22e6 * 1e8, 20e10);

        vm.expectRevert(bytes("Price overflow"));
        p.postAsk{value: stakeWei}(1e8, 20e20);

        vm.expectRevert(bytes("Amount underflow"));
        p.postAsk{value: stakeWei}(0, 20e10);

        vm.expectRevert(bytes("Price underflow"));
        p.postAsk{value: stakeWei}(1e8, 0);
    }

    function testBid() public returns (Portal p) {
        p = new Portal(ETH, 5, new StubBtcTxVerifier(), 1);
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Test a successful bid
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(1, -1e8, 20e10, 0, address(this));
        uint256 orderId = p.postBid{value: 20 ether}(
            1e8,
            20e10, /* 20 ETH/BTC */
            destScriptHash
        );
        assertEq(orderId, 1);

        // Test invalid asks
        vm.expectRevert(bytes("Wrong payment"));
        p.postBid{value: 21 ether}(1e8, 20e10, destScriptHash);

        vm.expectRevert(bytes("Amount overflow"));
        p.postBid{value: 20 ether}(22e6 * 1e8, 20e10, destScriptHash);

        vm.expectRevert(bytes("Price overflow"));
        p.postBid{value: 20 ether}(1e8, 20e20, destScriptHash);

        vm.expectRevert(bytes("Amount underflow"));
        p.postBid{value: 20 ether}(0, 20e10, destScriptHash);

        vm.expectRevert(bytes("Price underflow"));
        p.postBid{value: 20 ether}(1e8, 0, destScriptHash);
    }

    function testSell() public returns (Portal p) {
        p = testBid();

        // Hit the bid. Sell 1 BTC for 20 ETH.
        // Invalid sells first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateSell(1, 1e8);

        // Then, do it right. Stake 5% = 1 ETH.
        uint256 escrowID = p.initiateSell{value: 1 ether}(1, 1e8);
        assertEq(escrowID, 1);

        // Then, try to do it again; order is already filled.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 0.1 ether}(1, 1e7);
    }

    function testPartialSell() public returns (Portal p) {
        p = testBid();

        // Sell 0.1BTC for 2 ETH. Stake 5% = 0.1 ETH.
        uint256 escrowID = p.initiateSell{value: 0.1 ether}(1, 1e7);
        assertEq(escrowID, 1);

        vm.expectRevert(bytes("Escrow collision, please retry"));
        p.initiateSell{value: 0.1 ether}(1, 1e7);

        // Fill out the rest of the order. Sell 0.9BTC for 18ETH.
        escrowID = p.initiateSell{value: 0.9 ether}(1, 1e8 - 1e7);
        assertEq(escrowID, 2);

        // Order should be filled
        vm.expectRevert(bytes("Order already filled"));
        p.initiateSell{value: 0.1 ether}(1, 1e7);
    }

    function testBuy() public returns (Portal p) {
        p = testAsk();

        // Hit the ask. Buy 1 BTC for 20 ETH.
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";

        // Invalid buys first...
        vm.expectRevert(bytes("Wrong payment"));
        p.initiateBuy(orderID, 1e8, destScriptHash);

        vm.expectRevert(bytes("Amount incorrect"));
        p.initiateBuy(orderID, 9e23, destScriptHash);

        // Valid buy
        address alice = address(this);
        address bob = address(this);
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(
            1,
            orderID,
            1e8,
            1e8,
            20e10,
            0,
            uint128(block.timestamp + 24 hours),
            alice,
            bob,
            destScriptHash
        );
        uint256 escrowID = p.initiateBuy{value: 20 ether}(
            orderID,
            1e8,
            destScriptHash
        );
        assertEq(escrowID, 1);

        // Try again. Order should be filled now.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateBuy{value: 20 ether}(orderID, 1e8, destScriptHash);
    }

    function testPartialBuy() public returns (Portal p) {
        p = testAsk();

        // Hit the ask. Buy 0.1BTC for 2 ETH.
        uint256 orderID = 1;
        bytes20 destScriptHash = hex"0011223344556677889900112233445566778899";
        address alice = address(this);
        address bob = address(this);
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(
            1,
            orderID,
            1e8,
            1e7,
            20e10,
            0,
            uint128(block.timestamp + 24 hours),
            alice,
            bob,
            destScriptHash
        );
        uint256 escrowID = p.initiateBuy{value: 2 ether}(
            orderID,
            1e7,
            destScriptHash
        );
        assertEq(escrowID, 1);

        // Try the exact same amount and destination again.
        // This fails. Every open escrow must be unique.
        vm.expectRevert(bytes("Escrow collision, please retry"));
        p.initiateBuy{value: 2 ether}(orderID, 1e7, destScriptHash);

        // Take the rest of the order.
        p.initiateBuy{value: 18 ether}(orderID, 1e8 - 1e7, destScriptHash);

        // Try again. Order should be filled now.
        vm.expectRevert(bytes("Order already filled"));
        p.initiateBuy{value: 20 ether}(orderID, 1e8, destScriptHash);
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

        // First, stub in an failed proof validation.
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 1234, StubBtcProof.invalid(), 12);

        vm.expectRevert(bytes("Can't use old proof of payment"));
        p.proveSettlement(1, 998, StubBtcProof.valid(), 12);

        //  Prove settlement. Successful proof validation.
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e8, address(this), 21 ether);
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);
    }

    function testPartialSettleFromSell() public {
        Portal p = testPartialSell();

        // First, stub in an failed proof validation.
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 1234, StubBtcProof.invalid(), 12);

        vm.expectRevert(bytes("Can't use old proof of payment"));
        p.proveSettlement(1, 999, StubBtcProof.valid(), 12);

        //  Prove settlement. Successful proof validation.
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e7, address(this), 2.1 ether);
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Fill the final escrow
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(2, 1e8 - 1e7, address(this), 18.9 ether);
        p.proveSettlement(2, 1234, StubBtcProof.valid(), 12);
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

        // First, stub in an failed proof validation.
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 1234, StubBtcProof.invalid(), 12);

        //  Prove settlement. Successful proof validation.
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e8, address(this), 21 ether);
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);
    }

    function testPartialSettleFromBuy() public {
        Portal p = testPartialBuy();

        // First, stub in an failed proof validation.
        vm.expectRevert(bytes("Bad bitcoin transaction"));
        p.proveSettlement(1, 1234, StubBtcProof.invalid(), 12);

        //  Prove settlement. Successful proof validation.
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(1, 1e7, address(this), 2.1 ether);
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Finally, try again. Escrow should be gone.
        vm.expectRevert(bytes("Escrow not found"));
        p.proveSettlement(1, 1234, StubBtcProof.valid(), 12);

        // Fill the final escrow
        vm.expectEmit(true, true, true, true);
        emit EscrowSettled(2, 1e8 - 1e7, address(this), 18.9 ether);
        p.proveSettlement(2, 1234, StubBtcProof.valid(), 12);
    }

    function testWbtc() public returns (Portal p) {
        StubWbtc wbtc = new StubWbtc();
        p = new Portal(wbtc, 5, new StubBtcTxVerifier(), 1);
        uint256 initTok = 100 * 1e8;
        wbtc.cheatDeposit(initTok); // Give ourselves 100BTC
        wbtc.approve(address(p), 2**256 - 1); // Approve Portal to spend it

        // Sell 10 BTC, asking 10.1 WBTC
        // 1.01 tokens per bitcoin = 1.01e10 "wei"(=1e-18 token) per satoshi
        uint128 priceTps = 101e8;
        uint256 stakeTok = 5050_0000; // 0.505 WBTC = 5% of the total
        vm.expectEmit(true, true, true, true);
        emit OrderPlaced(1, 10e8, priceTps, stakeTok, address(this));
        uint256 orderId = p.postAsk(10e8, priceTps);
        assertEq(orderId, 1);
        assertEq(wbtc.balanceOf(address(this)), initTok - stakeTok);

        // Hit the ask. Buy 5 BTC for 5.05 WBTC.
        uint256 buyTok = 5_0500_0000; // 5.05 WBTC
        bytes20 destScriptHash = hex"9988776655443322110000112233445566778899";
        vm.expectEmit(true, true, true, true);
        emit OrderMatched(
            1,
            orderId,
            10e8,
            5e8,
            priceTps,
            0,
            uint128(block.timestamp + 24 hours),
            address(this),
            address(this),
            destScriptHash
        );
        uint256 escrowID = p.initiateBuy(1, 5e8, destScriptHash);
        assertEq(escrowID, 1);
        assertEq(wbtc.balanceOf(address(this)), initTok - stakeTok - buyTok);

        // Check that the escrow looks correct
        assertEq(p.btcVerifier().mirror().getLatestBlockHeight(), 1000);
        bytes32 destKey = keccak256(abi.encode(destScriptHash, uint256(5e8)));
        assertEq(p.openEscrows(destKey), 999);

        // Close escrow. Since we filled half our order, we get half stake back.
        p.proveSettlement(1, 1000, StubBtcProof.valid(), 0);
        assertEq(wbtc.balanceOf(address(this)), initTok - stakeTok / 2);

        // Cancel the remaining order. We should be precisely back to start.
        p.cancelOrder(1);
        assertEq(wbtc.balanceOf(address(this)), initTok);
    }
}

contract StubWbtc is ERC20 {
    constructor() ERC20("Wrapped BTC", "WBTC", 8) {}

    function cheatDeposit(uint256 tok) public {
        balanceOf[msg.sender] += tok;
    }
}

contract StubBtcMirror is IBtcMirror {
    constructor() {}

    function getBlockHash(uint256 number) external pure returns (bytes32) {
        return keccak256(abi.encode(number));
    }

    function getLatestBlockHeight() external pure returns (uint256) {
        return 1000;
    }

    function getLatestBlockTime() external pure returns (uint256) {
        return 1;
    }

    function submit(uint256, bytes calldata) external pure {
        return;
    }
}

library StubBtcProof {
    function valid() internal pure returns (BtcTxProof memory proof) {
        proof.txId = bytes32(uint256(1));
    }

    function invalid() internal pure returns (BtcTxProof memory proof) {}
}

contract StubBtcTxVerifier is IBtcTxVerifier {
    IBtcMirror private immutable _mirror;

    constructor() {
        _mirror = new StubBtcMirror();
    }

    function verifyPayment(
        uint256, /* minConfirmations */
        uint256, /* blockNum */
        BtcTxProof calldata proof,
        uint256, /* txOutIx */
        bytes20, /* destScriptHash */
        uint256 /* amountSats */
    ) external pure returns (bool) {
        return uint256(proof.txId) == 1;
    }

    function mirror() external view returns (IBtcMirror) {
        return _mirror;
    }
}
