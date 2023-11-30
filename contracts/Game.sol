// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Game {
    struct GameData {
        address creator;
        bytes32 secretHash;
        uint256 creationTime;
        uint256 betAmount;
        address opponent;
        uint8 opponentBet;
        bool ended;
    }

    uint256 public feePercentage;
    uint256 public revealSeconds;
    uint256 public returnSeconds;
    mapping(uint256 => GameData) public games;

    event GameCreated(uint256 indexed gameId, address indexed creator);
    event GameEnded(uint256 indexed gameId, address indexed winner);

    constructor(uint256 _feePercentage, uint256 _revealSeconds, uint256 _returnSeconds) {
        feePercentage = _feePercentage;
        revealSeconds = _revealSeconds;
        returnSeconds = _returnSeconds;
    }

    function create(uint256 gameId, bytes32 secret) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(games[gameId].creator == address(0), "Game already exists");

        uint256 betAmount = msg.value - calculateFee(msg.value);
        games[gameId] = GameData(msg.sender, secret, block.timestamp, betAmount, address(0), 0, false);

        emit GameCreated(gameId, msg.sender);
    }

    function bet(uint256 gameId, uint8 betValue) external payable {
        require(betValue >= 1 && betValue <= 3, "Bet must be between 1 and 3");
        GameData storage game = games[gameId];
        require(game.creator != address(0) && !game.ended, "Game does not exist or has ended");
        require(game.creator != msg.sender, "Creator cannot bet on their own game");
        require(game.opponent == address(0), "Game already has an opponent");

        uint256 expectedBetAmount = game.betAmount;
        require(msg.value == expectedBetAmount, "Incorrect bet amount");

        game.opponent = msg.sender;
        game.opponentBet = betValue;
    }

    function reveal(uint256 gameId, uint8 betValue, bytes32 secret) external {
        GameData storage game = games[gameId];
        require(game.creator == msg.sender, "Only creator can reveal");
        require(!game.ended, "Game already ended");
        require(block.timestamp <= game.creationTime + revealSeconds, "Reveal period expired");

        bytes32 calculatedHash = keccak256(abi.encodePacked(gameId, betValue, secret));
        require(calculatedHash == game.secretHash, "Invalid secret data");

        game.ended = true;
        address winner = determineWinner(game.creator, game.opponent, betValue, game.opponentBet);

        if (winner == address(0)) {
            // In case of a draw, return the betAmount to both players
            payable(game.creator).transfer(game.betAmount);
            payable(game.opponent).transfer(game.betAmount);
        } else {
            // Transfer the total bet amount to the winner
            uint256 totalBetAmount = game.betAmount * 2;
            payable(winner).transfer(totalBetAmount);
        }

        emit GameEnded(gameId, winner);
    }

    function returnStack(uint256 gameId) external {
        GameData storage game = games[gameId];
        require(game.creator == msg.sender, "Only creator can return stack");
        require(game.opponent == address(0), "Game already has an opponent");
        require(block.timestamp >= game.creationTime + returnSeconds, "Return period not reached");

        game.ended = true;
        uint256 totalAmount = game.betAmount + calculateFee(game.betAmount);
        payable(msg.sender).transfer(totalAmount);
    }

    function calculateFee(uint256 amount) internal view returns (uint256) {
        return amount * feePercentage / 100;
    }

    function determineWinner(address creator, address opponent, uint8 creatorBet, uint8 opponentBet) internal pure returns (address) {
        if ((creatorBet == 1 && opponentBet == 2) ||
        (creatorBet == 2 && opponentBet == 3) ||
            (creatorBet == 3 && opponentBet == 1)) {
            return opponent;
        } else if (creatorBet == opponentBet) {
            return address(0); // Draw, no winner
        } else {
            return creator;
        }
    }
}
