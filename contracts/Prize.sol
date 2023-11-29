// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Prize {
    struct PrizeData {
        uint256[] communities;
        uint256 prizeTotalAmount;
        uint256 maxParticipants;
        uint256 claimedParticipants;
        uint256 deadline;
    }

    mapping(uint256 => PrizeData) public prizes;
    uint256 public earned;
    mapping(address => uint256) public balances;
    address public creator;
    uint256 public maxClaimDays;
    uint256 public commissionPercentage;

    constructor(uint256 _maxClaimDays, uint256 _commissionPercentage) {
        creator = msg.sender;
        maxClaimDays = _maxClaimDays;
        commissionPercentage = _commissionPercentage;
    }

    function create(uint256[] memory communities, uint256 maxParticipants, uint256 deadline) public payable {
        require(msg.value % maxParticipants == 0, "Amount should be dividable by maxParticipants");

        uint256 commission = (msg.value * commissionPercentage) / 100;
        uint256 prizeAmount = msg.value - commission;
        earned += commission;

        PrizeData memory newPrize = PrizeData({
            communities: communities,
            prizeTotalAmount: prizeAmount,
            maxParticipants: maxParticipants,
            claimedParticipants: 0,
            deadline: deadline
        });

        prizes[getPrizesLength()] = newPrize;
    }

    function claim(uint256 prizeId, uint256 userId, bytes memory proof) public {
        require(prizes[prizeId].deadline + maxClaimDays > block.timestamp, "Claim period over");
        require(prizes[prizeId].claimedParticipants < prizes[prizeId].maxParticipants, "Max participants reached");

        uint256 prizeAmount = prizes[prizeId].prizeTotalAmount / prizes[prizeId].maxParticipants;
        balances[msg.sender] += prizeAmount;
        prizes[prizeId].claimedParticipants++;
    }

    function claimEarnings() public {
        require(msg.sender == creator, "Only creator can claim earnings");
        require(earned > 0, "No earnings to claim");

        payable(creator).transfer(earned);
        earned = 0;
    }

    function getPrizesLength() public view returns (uint256) {
        // This function returns the next available ID (length of the mapping)
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 1000;
    }
}
