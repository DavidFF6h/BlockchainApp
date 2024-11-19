// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Identity {
    struct User {
        string ipfsHash; // Stores IPFS hash of the user's data
        bool isVerified;
    }

    mapping(address => User) private users;

    // Event emitted when a user is registered
    event UserRegistered(address indexed userAddress, string ipfsHash);

    // Register a new user by storing their IPFS hash
    function registerUser(string memory _ipfsHash) public {
        require(bytes(users[msg.sender].ipfsHash).length == 0, "User already registered.");
        users[msg.sender] = User(_ipfsHash, false);
        emit UserRegistered(msg.sender, _ipfsHash);
    }

    // Get user information
    function getUser(address _userAddress) public view returns (string memory, bool) {
        return (users[_userAddress].ipfsHash, users[_userAddress].isVerified);
    }

    // Verify user
    function verifyUser(address _userAddress) public {
        users[_userAddress].isVerified = true;
    }
}
