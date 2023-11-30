// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Game {
    function verify(uint8 byteData, uint256 gameId, bytes memory signature) external view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(byteData, gameId));
        bytes32 message = MessageHashUtils.toEthSignedMessageHash(hash);
        require(ECDSA.recover(message, signature) == msg.sender, "Invalid signature");

        return true;
    }
}
