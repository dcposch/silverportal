// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "btcmirror/interfaces/IBtcTxVerifier.sol";
import "solmate/auth/Owned.sol";
import "openzeppelin-contracts/interfaces/IERC20.sol";
import {PRBMathSD59x18} from "prb-math/PRBMathSD59x18.sol";

//
//                                        #
//                                       # #
//                                      # # #
//                                     # # # #
//                                    # # # # #
//                                   # # # # # #
//                                  # # # # # # #
//                                 # # # # # # # #
//                                # # # # # # # # #
//                               # # # # # # # # # #
//                              # # # # # # # # # # #
//                                   # # # # # #
//                               +        #        +
//                                ++++         ++++
//                                  ++++++ ++++++
//                                    +++++++++
//                                      +++++
//                                        +
//

// Max order size: 21m BTC
uint256 constant MAX_SATS = 21e6 * 1e8;
// Max allowed price: 1sat = 1WETH or 1e18 of another ERC20 token.
uint256 constant MAX_PRICE_TOK_PER_SAT = 1e18;

/**
 * @dev Each order represents a bid or ask.
 */
struct Order {
    /** @dev Market maker that created this bid or ask. */
    address maker;
    /** @dev Positive if buying ether (bid), negative if selling (ask). */
    int128 amountSats;
    /** @dev INVERSE price, in token units per sat. */
    uint128 priceTokPerSat;
    /** @dev Unused for bid. Bitcoin P2SH address for asks. */
    bytes20 scriptHash;
    /** @dev Unused for ask. Staked token amount for bids. */
    uint256 stakedTok;
}

/**
 * @dev During an in-progress transaction, ether is held in escrow.
 */
struct Escrow {
    /** @dev Bitcoin P2SH address to which bitcoin must be sent. */
    bytes20 destScriptHash;
    /** @dev Bitcoin due, in satoshis. */
    uint128 amountSatsDue;
    /** @dev Due date, in Unix seconds. */
    uint128 deadline;
    /** @dev Tokens held in escrow. */
    uint256 escrowTok;
    /** @dev If correct amount is paid to script hash, who keeps the escrow? */
    address successRecipient;
    /** @dev If deadline passes without proof of payment, who keeps escrow? */
    address timeoutRecipient;
}

/** @notice Implements a limit order book for trust-minimized BTC-ETH trades. */
contract Portal is Owned {
    using PRBMathSD59x18 for int256;

    event OrderPlaced(
        uint256 orderID,
        int128 amountSats,
        uint128 priceTokPerSat,
        uint256 makerStakedTok,
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
        uint128 priceTokPerSat,
        uint256 takerStakedTok,
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

    /** The token we are trading for BTC. */
    IERC20 public immutable token;

    /**
     * @dev Required stake for buy transactions. If you promise to send X BTC to
     *      buy Y ETH, you have post some percentage of Y ETH, which you lose if
     *      you don't follow thru sending the Bitcoin. Same for bids.
     */
    uint256 public stakePercent;

    /** @dev Number of bitcoin confirmations required to settle a trade. */
    uint256 public minConfirmations;

    /** @dev Bitcoin light client. Reports block hashes, allowing tx proofs. */
    IBtcTxVerifier public btcVerifier;

    /** @dev Tracks all available liquidity (bids and asks). */
    mapping(uint256 => Order) public orderbook;

    /** @dev Tracks all pending transactions, by order ID. */
    mapping(uint256 => Escrow) public escrows;

    /** @dev Next order ID = number of orders so far + 1. */
    uint256 public nextOrderID;
    
    /** @dev Next escrow ID = number of fills/partial fills so far + 1. */
    uint256 public nextEscrowID;

    constructor(
        IERC20 _token,
        uint256 _stakePercent,
        IBtcTxVerifier _btcVerifier
    ) Owned(msg.sender) {
        token = _token;
        stakePercent = _stakePercent;
        btcVerifier = _btcVerifier;
        nextOrderID = 1;
        nextEscrowID = 1;
        minConfirmations = 1;
    }

    /** @notice Owner-settable parameter. */
    function setStakePercent(uint256 _stakePercent) public onlyOwner {
        uint256 old = stakePercent;
        stakePercent = _stakePercent;
        emit ParamUpdated(old, stakePercent, "stakePercent");
    }

    /** @notice Owner-settable parameter. */
    function setMinConfirmations(uint256 _minConfirmations) public onlyOwner {
        uint256 old = minConfirmations;
        minConfirmations = _minConfirmations;
        emit ParamUpdated(old, minConfirmations, "minConfirmations");
    }

    /** @notice Owner-settable parameter. */
    function setBtcVerifier(IBtcTxVerifier _btcVerifier) public onlyOwner {
        uint160 old = uint160(address(btcVerifier));
        btcVerifier = _btcVerifier;
        emit ParamUpdated(old, uint160(address(btcVerifier)), "btcVerifier");
    }

    /**
     * @notice Posts a bid. By calling this function, you represent that you
     *         have a stated amount of bitcoin, and are willing to buy ether
     *         at the stated price. You must stake a percentage of the total
     *         eth value, which is returned after a successful transaction.
     */
    function postBid(uint256 amountSats, uint256 priceTokPerSat)
        public
        payable
        returns (uint256 orderID)
    {
        // Validate order and stake amount.
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(priceTokPerSat <= MAX_PRICE_TOK_PER_SAT, "Price overflow");
        require(priceTokPerSat > 0, "Price underflow");
        uint256 totalValueTok = amountSats * priceTokPerSat;
        uint256 requiredStakeTok = (totalValueTok * stakePercent) / 100;

        // Receive stake amount
        _transferFromSender(requiredStakeTok);

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = int128(uint128(amountSats));
        o.priceTokPerSat = uint128(priceTokPerSat);
        o.stakedTok = requiredStakeTok;

        emit OrderPlaced(
            orderID,
            o.amountSats,
            o.priceTokPerSat,
            o.stakedTok,
            msg.sender
        );
    }

    /**
     * @notice Posts an ask. You send ether, which is now for sale at the stated
     *         price. To buy, a buyer sends bitcoin to the state P2SH address.
     */
    function postAsk(
        uint256 amountSats,
        uint256 priceTokPerSat,
        bytes20 scriptHash
    ) public payable returns (uint256 orderID) {
        require(priceTokPerSat <= MAX_PRICE_TOK_PER_SAT, "Price overflow");
        require(priceTokPerSat > 0, "Price underflow");
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");

        // Receive payment
        _transferFromSender(amountSats * priceTokPerSat);

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.maker = msg.sender;
        o.amountSats = -int128(uint128(amountSats));
        o.priceTokPerSat = uint128(priceTokPerSat);
        o.scriptHash = scriptHash;

        emit OrderPlaced(
            orderID,
            o.amountSats,
            o.priceTokPerSat,
            0,
            msg.sender
        );
    }

    function cancelOrder(uint256 orderID) public {
        Order storage o = orderbook[orderID];

        require(o.amountSats != 0, "Order not found");
        require(msg.sender == o.maker, "Order not yours");

        uint256 tokToSend;
        if (o.amountSats > 0) {
            // Bid, return stake
            tokToSend = o.stakedTok;
        } else {
            // Ask, return liquidity
            tokToSend = uint256(uint128(-o.amountSats) * o.priceTokPerSat);
        }

        emit OrderCancelled(orderID);

        // Delete order now. Prevent reentrancy issues.
        delete orderbook[orderID];

        _transferToSender(tokToSend);
    }

    /** @notice Buy ether, posting stake and promising to send bitcoin. */
    function initiateBuy(uint256 orderID, uint128 amountSats)
        public
        payable
        returns (uint256 escrowID)
    {
        escrowID = nextEscrowID++;

        Order storage o = orderbook[orderID];
        require(o.amountSats < 0, "Order already filled");
        require(-o.amountSats >= int128(amountSats), "Amount incorrect");

        // Verify correct stake amount.
        uint256 totalTok = uint256(amountSats) * uint256(o.priceTokPerSat);
        uint256 expectedStakeTok = (totalTok * stakePercent) / 100;

        // Receive stake. Validates that msg.value == expectedStateTok (for ether based payments)
        _transferFromSender(expectedStakeTok);

        // Put the COMBINED eth (buyer's stake + the order amount) into escrow.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = o.scriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowTok = totalTok + expectedStakeTok;
        e.successRecipient = msg.sender;
        e.timeoutRecipient = o.maker;

        // Order matched.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            int128(amountSats),
            o.priceTokPerSat,
            expectedStakeTok,
            o.maker,
            msg.sender
        );

        // Update the amount of liquidity in this order
        o.amountSats += int128(amountSats);

        // Delete the order if there is no more liquidity left
        if (o.amountSats == 0) {
          delete orderbook[orderID];
        }
    }

    /** @notice Sell ether, receive bitcoin. */
    function initiateSell(
        uint256 orderID,
        uint128 amountSats,
        bytes20 destScriptHash
    ) public payable returns (uint256 escrowID) {
        escrowID = nextEscrowID++;
        Order storage o = orderbook[orderID];
        require(o.amountSats > 0, "Order already filled"); // Must be a bid
        require(o.amountSats >= int128(amountSats), "Amount incorrect");

        uint256 totalValue = amountSats * o.priceTokPerSat;
        int256 orderSats = int256(o.amountSats).fromInt();
        int256 fillSats = int256(uint256(amountSats)).fromInt();
        int256 stake = int256(o.stakedTok).fromInt();

        int256 ratio = fillSats.div(orderSats);
        uint256 portionOfStake = uint256(stake.mul(ratio)) / 1e18;

        // Receive sale payment
        _transferFromSender(totalValue);

        // Put the COMBINED eth--the value being sold, plus the liquidity
        // maker's stake--into escrow. If the maker sends bitcoin as
        // expected and provides proof, they get both (stake back + proceeds).
        // If maker fails to deliver, they're slashed and seller gets both.
        Escrow storage e = escrows[escrowID];
        e.destScriptHash = destScriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowTok = portionOfStake + totalValue;
        e.successRecipient = o.maker;
        e.timeoutRecipient = msg.sender;

        // Order matched.
        emit OrderMatched(
            escrowID,
            orderID,
            o.amountSats,
            int128(amountSats),
            o.priceTokPerSat,
            0,
            o.maker,
            msg.sender
        );

        o.amountSats -= int128(amountSats);
        o.stakedTok -= portionOfStake;
        emit OrderCancelled(o.stakedTok);

        // Delete the order if its been filled.
        if (o.amountSats == 0) {
          delete orderbook[orderID];
        }
    }

    /** @notice The bidder proves they've sent bitcoin, completing the sale. */
    function proveSettlement(
        uint256 escrowID,
        uint256 bitcoinBlockNum,
        BtcTxProof calldata bitcoinTransactionProof,
        uint256 txOutIx
    ) public {
        Escrow storage e = escrows[escrowID];
        require(e.successRecipient != address(0), "Escrow not found");
        require(msg.sender == e.successRecipient, "Wrong caller");

        bool valid = btcVerifier.verifyPayment(
            minConfirmations,
            bitcoinBlockNum,
            bitcoinTransactionProof,
            txOutIx,
            e.destScriptHash,
            uint256(e.amountSatsDue)
        );
        require(valid, "Bad bitcoin transaction");

        uint256 tokToSend = e.escrowTok;

        emit EscrowSettled(escrowID, e.amountSatsDue, msg.sender, tokToSend);

        delete escrows[escrowID];

        _transferToSender(tokToSend);
    }

    function slash(uint256 escrowID) public {
        Escrow storage e = escrows[escrowID];

        require(msg.sender == e.timeoutRecipient, "Wrong caller");
        require(e.deadline < block.timestamp, "Too early");

        uint256 tokToSend = e.escrowTok;
        emit EscrowSlashed(escrowID, e.deadline, msg.sender, tokToSend);

        delete escrows[escrowID];

        _transferToSender(tokToSend);
    }

    // Update an existing bid or ask order. amountSats is negative if the order is an ask.
    function updateOrder(uint256 orderID, int128 amountSats) public payable {
        Order storage o = orderbook[orderID];

        require(o.amountSats != 0, "Order not found");
        require(o.maker == msg.sender, "Order not yours");

        if (o.amountSats < 0) {
          // This is an ask. Receive the ether to be sold and update the order.
          require(amountSats < 0 && uint256(int256(-(o.amountSats + amountSats))) <= MAX_SATS, "Must be adding a valid amount of liquidity");

          uint256 additionalValue = uint256(int256(-amountSats * int128(o.priceTokPerSat)));
          o.amountSats += amountSats;

          _transferFromSender(additionalValue);
        } else {
          // This is a bid, update the order and take the additional stake
          require(amountSats > 0 && uint256(int256(o.amountSats)) + uint256(int256(amountSats)) <= MAX_SATS, "Must be adding a valid amount of liquidity");
          uint256 expectedStakeTok = (uint256(int256(amountSats)) * uint256(o.priceTokPerSat) * stakePercent) / 100;
          
          // Update the order
          o.amountSats += amountSats;
          o.stakedTok += expectedStakeTok;

          // Receive the additional stake
          _transferFromSender(expectedStakeTok);
        }

        emit OrderUpdated(
          orderID,
          o.amountSats,
          o.stakedTok,
          o.maker
        );
    }

    function _transferFromSender(uint256 tok) private {
        if (address(token) == address(0)) {
            // Receive wei
            require(msg.value == tok, "Wrong payment");
            return;
        }

        bool success = token.transferFrom(msg.sender, address(this), tok);
        require(success, "transferFrom failed");
    }

    function _transferToSender(uint256 tok) private {
        if (address(token) == address(0)) {
            // Send wei
            (bool suc, ) = msg.sender.call{value: tok}(hex"");
            require(suc, "Send failed");
            return;
        }

        bool success = token.transfer(msg.sender, tok);
        require(success, "transfer failed");
    }
}
