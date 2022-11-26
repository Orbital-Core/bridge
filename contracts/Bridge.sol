// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Bridge is OwnableUpgradeable {
    IERC20 public bridgeToken;

    event Deposited (
        address user,
        uint256 amount,
        string account
    );

    function initialize(IERC20 _bridgeToken) public initializer {
        bridgeToken = _bridgeToken;
        __Ownable_init();
    }

    function deposit(uint256 amount, string memory account) external {
        bridgeToken.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount, account);
    }

    function verifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }
}