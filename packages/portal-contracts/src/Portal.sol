// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "btcmirror/interfaces/IBtcTxVerifier.sol";

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

uint256 constant MAX_SATS = 21000000 * 100 * 1000000; // 21m BTC in sats
uint256 constant MAX_PRICE_WEI_PER_SAT = 1e18; // Max allowed price, 1sat = 1ETH
uint256 constant NUM_CONFIRMATIONS_REQUIRED = 1; // Bitcoin payment finality

/**
 * @dev Each order represents a bid or ask.
 */
struct Order {
    /** @dev Liquidity provider that created this bid or ask. */
    address provider;
    /** @dev Positive if buying ether (bid), negative if selling (ask). */
    int128 amountSats;
    /** @dev Buy or sell price. */
    uint128 priceWeiPerSat;
    /** @dev Unused for bid. Bitcoin P2SH address for asks. */
    bytes20 scriptHash;
    /** @dev Unused for ask. Staked wei for bids. */
    uint256 stakedWei;
}

/**
 * @dev During an in-progress transaction, ether is held in escrow.
 */
struct Escrow {
    /** @dev Bitcoin P2SH address to which bitcoin must be sent. */
    bytes20 recipientScriptHash;
    /** @dev Bitcoin due, in satoshis. */
    uint128 amountSatsDue;
    /** @dev Due date, in Unix seconds. */
    uint128 deadline;
    /** @dev Ether held in escrow. */
    uint256 escrowWei;
    /** @dev If correct amount is paid to script hash, who gets the eth? */
    address successRecipient;
    /** @dev If deadline passes without proof of payment, who gets the eth? */
    address timeoutRecipient;
}

contract Portal {
    /**
     * @dev Required stake for buy transactions. If you promise to send X BTC to
     *      buy Y ETH, you have post some percentage of Y ETH, which you lose if
     *      you don't follow thru sending the Bitcoin. Same for bids.
     */
    uint256 public immutable stakePercent;

    /** @dev Bitcoin light client. Reports block hashes, allowing tx proofs. */
    IBtcTxVerifier public immutable btcVerifier;

    /** @dev Tracks all available liquidity (bids and asks). */
    mapping(uint256 => Order) orderbook;

    /** @dev Tracks all pending transactions, by order ID. */
    mapping(uint256 => Escrow) escrows;

    /** @dev Next order ID = number of orders so far + 1. */
    uint256 nextOrderID;

    constructor(uint256 _stakePercent, IBtcTxVerifier _btcVerifier) {
        stakePercent = _stakePercent;
        btcVerifier = _btcVerifier;
        nextOrderID = 1;
    }

    /**
     * @notice Posts a bid. By calling this function, you represent that you
     *         have a stated amount of bitcoin, and are willing to buy ether
     *         at the stated price. You must stake a percentage of the total
     *         eth value, which is returned after a successful transaction.
     */
    function postBid(uint256 amountSats, uint256 priceWeiPerSat)
        public
        payable
        returns (uint256 orderID)
    {
        // Validate order and stake amount.
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT, "Price overflow");
        require(priceWeiPerSat > 0, "Price underflow");
        uint256 totalValueWei = amountSats * priceWeiPerSat;
        uint256 requiredStakeWei = (totalValueWei * stakePercent) / 100;
        require(msg.value == requiredStakeWei, "Incorrect stake");

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.provider = msg.sender;
        o.amountSats = int128(uint128(amountSats));
        o.priceWeiPerSat = uint128(priceWeiPerSat);
        o.stakedWei = requiredStakeWei;
    }

    /**
     * @notice Posts an ask. You send ether, which is now for sale at the stated
     *         price. To buy, a buyer sends bitcoin to the state P2SH address.
     */
    function postAsk(uint256 priceWeiPerSat, bytes20 scriptHash)
        public
        payable
        returns (uint256 orderID)
    {
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT, "Price overflow");
        require(priceWeiPerSat > 0, "Price underflow");
        uint256 amountSats = msg.value / priceWeiPerSat;
        require(amountSats <= MAX_SATS, "Amount overflow");
        require(amountSats > 0, "Amount underflow");
        require(amountSats * priceWeiPerSat == msg.value, "Wrong payment");

        // Record order.
        orderID = nextOrderID++;
        Order storage o = orderbook[orderID];
        o.provider = msg.sender;
        o.amountSats = -int128(uint128(amountSats));
        o.priceWeiPerSat = uint128(priceWeiPerSat);
        o.scriptHash = scriptHash;
    }

    function withdrawBid(uint256 orderID) public {
        // TODO
    }

    function withdrawAsk(uint256 orderID) public {
        // TODO
    }

    /** @notice Sell ether, receive bitcoin. */
    function initiateSell(
        uint256 orderID,
        uint128 amountSats,
        bytes20 recipientScriptHash
    ) public payable returns (uint256 escrowID) {
        // Orders can only be filled in their entirety, for now.
        // This means escrows are 1:1 with orders.
        // TODO: allow partial fills?
        escrowID = orderID * 1e9;
        Order storage o = orderbook[orderID];
        require(o.amountSats == int128(amountSats), "Amount incorrect");
        require(msg.value == amountSats * o.priceWeiPerSat, "Wrong payment");

        // Put the COMBINED eth--the value being sold, plus the liquidity
        // provider's stake--into escrow. If the provider sends bitcoin as
        // expected and provides proof, they get both (stake back + proceeds).
        // If provider fails to deliver, they're slashed and seller gets both.
        Escrow storage e = escrows[escrowID];
        e.recipientScriptHash = recipientScriptHash;
        e.amountSatsDue = amountSats;
        e.deadline = uint128(block.timestamp + 24 hours);
        e.escrowWei = o.stakedWei + msg.value;
        e.successRecipient = o.provider;
        e.timeoutRecipient = msg.sender;

        // Order matched and filled.
        delete orderbook[orderID];
    }

    /** @notice The bidder proves they've sent bitcoin, completing the sale. */
    function completeSell(
        uint256 escrowID,
        uint256 bitcoinBlockNum,
        BtcTxProof calldata bitcoinTransactionProof,
        uint256 txOutIx
    ) public {
        Escrow storage e = escrows[escrowID];
        require(msg.sender == e.successRecipient, "Wrong caller");

        require(
            btcVerifier.verifyPayment(
                NUM_CONFIRMATIONS_REQUIRED,
                bitcoinBlockNum,
                bitcoinTransactionProof,
                txOutIx,
                e.recipientScriptHash,
                uint256(e.amountSatsDue)
            ),
            "Bad bitcoin transaction"
        );

        uint256 weiToSend = e.escrowWei;
        delete escrows[escrowID];

        (bool success, ) = msg.sender.call{value: weiToSend}("");
        require(success, "Transfer failed");
    }

    function timeout(uint256 escrowID) public {
        Escrow storage e = escrows[escrowID];

        require(msg.sender == e.timeoutRecipient, "Wrong caller");
        require(e.deadline < block.timestamp, "Too early");

        uint256 weiToSend = e.escrowWei;
        delete escrows[escrowID];

        (bool success, ) = msg.sender.call{value: weiToSend}("");
        require(success, "Transfer failed");
    }

    function initiateBtcForEth(uint256 lpID, uint256 amountSats)
        public
        payable
        returns (uint256 escrowID)
    {
        // TODO
    }

    function completeBtcForEth(uint256 escrowID, bytes calldata proof) public {
        // TODO
    }
}
