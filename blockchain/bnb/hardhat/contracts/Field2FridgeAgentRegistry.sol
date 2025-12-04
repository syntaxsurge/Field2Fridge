// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title Field2Fridge Agent Registry (ERC-8004 style identity)
contract Field2FridgeAgentRegistry is ERC721URIStorage {
    uint256 private _nextAgentId;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string tokenURI);

    constructor() ERC721("Field2Fridge Agent", "F2FA") {}

    function register(string calldata tokenURI_) external returns (uint256 agentId) {
        agentId = ++_nextAgentId;
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, tokenURI_);
        emit AgentRegistered(agentId, msg.sender, tokenURI_);
    }
}
