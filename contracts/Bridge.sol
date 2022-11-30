// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bridge is OwnableUpgradeable {
    IERC20 public bridgeToken;

    /// @notice This mapping stores the nextNonce of an sidechain account
    mapping (address => uint256) nextNonce;

    /// @notice This variable store the total validators in the sidechain
    uint8 public totalValidators;
    
    /// @notice This mapping tells us if an sidechain account is a validator or not
    mapping(address => bool) public validators;

    /// @notice Tracks which validator has signed the transaction
    mapping (address => mapping(uint => mapping(address => bool))) validatorSigned;
    
    event Deposited (
        address user,
        uint256 amount,
        string account
    );

    event TransactionProcessed (
        address account,
        uint nonce,
        TransactionType txnType,
        uint amount
    );

    enum TransactionType {
      ADD_VALIDATOR,
      REMOVE_VALIDATOR,
      WITHDRAW  
    }

    function initialize(IERC20 _bridgeToken, address validator) public initializer {
        bridgeToken = _bridgeToken;
        totalValidators = 1;
        validators[validator] = true;

        __Ownable_init();
    }

    function deposit(
        uint256 amount, string memory account
    ) external {
        bridgeToken.transferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount, account);
    }

    function getMessageHash(
        address account,
        uint nonce,
        TransactionType txnType,
        uint amount
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(account, nonce, txnType, amount, getChainID()));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

     function splitSignature(bytes memory sig)
        public
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(sig.length == 65, "invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function processTransaction(
        address account,
        uint nonce,
        TransactionType txnType,
        uint amount,
        bytes[] memory signatures
    ) external {
        require(signatures.length >= (totalValidators / 2) + 1, "more than half of validators need to sign");
        require(nonce == nextNonce[account], "invalid nonce");

        uint totalSigned; 

        for(uint i = 0; i < signatures.length; i++) {
            bytes32 messageHash = getMessageHash(account, nonce, txnType, amount);
            bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
            address signer = recoverSigner(ethSignedMessageHash, signatures[i]);

            if (validatorSigned[account][nonce][signer] == false && validators[signer] == true) {
                totalSigned++;
                validatorSigned[account][nonce][signer] = true;
            }
        }

        require(totalSigned >= (totalValidators / 2) + 1, "insufficient validators signed");
        nextNonce[account]++;

        if (txnType == TransactionType.ADD_VALIDATOR) {
            totalValidators++;
            validators[account] = true;
        } else if (txnType == TransactionType.REMOVE_VALIDATOR) {
            totalValidators--;
            validators[account] = false;
        } else if (txnType == TransactionType.WITHDRAW) {
            bridgeToken.transfer(account, amount);
        }

        emit TransactionProcessed(account, nonce, txnType, amount);
    }

    function getChainID() internal view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }
}