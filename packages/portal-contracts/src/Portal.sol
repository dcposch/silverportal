// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

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
uint256 constant MAX_PRICE_WEI_PER_SAT = 1e18; // Every satoshi worth 1ETH

contract Portal {
    uint256 public immutable stakePercent;
    IBitcoinMirror public immutable mirror;

    constructor(uint256 _stakePercent, IBitcoinMirror _mirror) {
        stakePercent = _stakePercent;
        mirror = _mirror;
    }

    function postBitcoin(uint256 amountSats, uint256 priceWeiPerSat)
        public
        payable
        returns (uint256 lpID)
    {
        require(amountSats <= MAX_SATS);
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT);
        uint256 totalValueWei = amountSats * priceWeiPerSat;
        uint256 requiredStakeWei = (totalValueWei * stakePercent) / 100;
        require(msg.value == requiredStakeWei, "Must post required stake.");

        // TODO: create LP record, record stake.
    }

    function postEther(uint256 priceWeiPerSat)
        public
        payable
        returns (uint256 lpID)
    {
        require(priceWeiPerSat <= MAX_PRICE_WEI_PER_SAT);

        // TODO: create LP record, record liquidity.
    }

    function withdrawBitcoin(uint256 lpID) public {
        // TODO: how to ID an LP record?
    }

    function withdrawEther(uint256 lpID) public {
        // TODO: how to ID an LP record?
    }

    function initiateEthForBtc(uint256 lpID, uint256 amountSats)
        public
        payable
        returns (uint256 escrowID)
    {
        // TODO
    }

    function completeEthForBtc(uint256 escrowID, bytes calldata proof) public {
        // TODO
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
