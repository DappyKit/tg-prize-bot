// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title A betting game contract
 */
contract Game {
    // Represents a single game's data
    struct GameData {
        address creator; // The address of the game creator
        bytes32 secretHash; // Hash of the game secret (gameId, betValue, secret)
        uint256 creationTime; // Timestamp when the game was created
        uint256 betAmount; // The amount of ether bet in the game
        address opponent; // The address of the opponent in the game
        uint8 opponentBet; // The bet value placed by the opponent
        bool ended; // Flag indicating if the game has ended
    }

    uint256 public feePercentage; // Percentage of the bet that is taken as a fee
    uint256 public revealSeconds; // Time period in seconds for the game creator to reveal the game
    uint256 public returnSeconds; // Time period in seconds after which the creator can return the stake if no opponent joins
    mapping(uint256 => GameData) public games; // Mapping from gameId to GameData

    // Event emitted when a game is created
    event GameCreated(uint256 indexed gameId, address indexed creator);
    // Event emitted when a game ends
    event GameEnded(uint256 indexed gameId, address indexed winner);

    // Contract constructor
    constructor(uint256 _feePercentage, uint256 _revealSeconds, uint256 _returnSeconds) {
        feePercentage = _feePercentage;
        revealSeconds = _revealSeconds;
        returnSeconds = _returnSeconds;
    }

    // Creates a new game
    function create(uint256 gameId, bytes32 secret) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(games[gameId].creator == address(0), "Game already exists");

        uint256 betAmount = msg.value - calculateFee(msg.value);
        games[gameId] = GameData(msg.sender, secret, block.timestamp, betAmount, address(0), 0, false);

        emit GameCreated(gameId, msg.sender);
    }

    // Places a bet in an existing game
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

    // Reveals the game, determines the winner, and transfers the bet amount
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

    // Allows the game creator to return the stake if no opponent joins
    function returnStack(uint256 gameId) external {
        GameData storage game = games[gameId];
        require(game.creator == msg.sender, "Only creator can return stack");
        require(game.opponent == address(0), "Game already has an opponent");
        require(block.timestamp >= game.creationTime + returnSeconds, "Return period not reached");

        game.ended = true;
        uint256 totalAmount = game.betAmount + calculateFee(game.betAmount);
        payable(msg.sender).transfer(totalAmount);
    }

    // Calculates the fee based on the bet amount
    function calculateFee(uint256 amount) internal view returns (uint256) {
        return amount * feePercentage / 100;
    }

    // Determines the winner of the game
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
