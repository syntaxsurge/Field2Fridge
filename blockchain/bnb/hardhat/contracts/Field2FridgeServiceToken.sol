// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Service token for paid agent calls (x402 / AWE flows)
contract Field2FridgeServiceToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Field2Fridge Service", "F2FS") {
        _mint(msg.sender, initialSupply);
    }
}
