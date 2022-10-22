// SPDX-License-Identifier: AGPL-3.0

// TODO: polygons implementation of SBTs https://polygonscan.com/address/0x42c091743f7b73b2f0043b1fb822b63aaa05041b#code

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Enums.sol";

import "hardhat/console.sol";

// Entities:
// creator/issuer
// url
// claimer

/**
 * @dev Soulbound (aka non-transferable) ERC721 token with storage based token URI management.
 */
//  TODO(nocs): validate if we need ERC721URIStorage aka tokenURI as we are already storing it manually.
contract Soulbound is ERC721URIStorage, Ownable {
    event ClaimToken(address, uint256);

    struct Token {
        BurnAuth burnAuth;
        uint256 count;
        uint256 limit;
        address owner;
        bool restricted;
        string uri;
    }

    struct Receiver {
        // TODO(nocs): sort out email logic
        string email;
        bool issued;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _eventIds;
    Counters.Counter private _tokenIds;
    uint256 private _limitMax = 10000;

    // Event Id => address => Receiver
    mapping(uint256 => mapping(address => Receiver)) public issuedTokens;
    // Event Id => Token
    mapping(uint256 => Token) public createdTokens;

    constructor() ERC721("Soulbound", "Bound") {}

    modifier onlyBurnAuth(uint256 tokenId, uint256 eventId) {
        if (createdTokens[eventId].burnAuth == BurnAuth.OwnerOnly) {
            require(msg.sender == ownerOf(tokenId), "Only owner may burn");
        }
        if (createdTokens[eventId].burnAuth == BurnAuth.IssuerOnly) {
            require(msg.sender == createdTokens[eventId].owner, "Only issuer may burn");
        }
        if (createdTokens[eventId].burnAuth == BurnAuth.Both) {
            require(
                msg.sender == createdTokens[eventId].owner || msg.sender == ownerOf(tokenId),
                "Only issuer or owner may burn"
            );
        }
        if (createdTokens[eventId].burnAuth == BurnAuth.Neither) {
            revert("Burn not allowed");
        }
        _;
    }

    // Soulbind functionality
    function transferFrom(
        address ,//from,
        address ,//to,
        uint256 //tokenId
    ) public pure override {
        revert("This token is soulbound and cannot be transfered!");
    }

    function safeTransferFrom(
        address ,//from,
        address ,//to,
        uint256 //tokenId
    ) public pure override {
        revert("This token is soulbound and cannot be transfered!");
    }

    function safeTransferFrom(
        address ,//from,
        address ,//to,
        uint256 ,//tokenId,
        bytes memory //_data
    ) public pure override {
        revert("This token is soulbound and cannot be transfered!");
    }

    // Non pre-issued tokens with limit
    function createToken(string memory tokenURI, uint256 limit, BurnAuth _burnAuth) public {
        _eventIds.increment();
        uint256 eventId = _eventIds.current();

        createdTokens[eventId].owner = msg.sender;
        createdTokens[eventId].uri = tokenURI;
        createdTokens[eventId].limit = limit;
        createdTokens[eventId].restricted = false;
        createdTokens[eventId].burnAuth = _burnAuth;
    }

    // Pre-issued token
    function createToken(string memory tokenURI, address to, BurnAuth _burnAuth) public {
        _eventIds.increment();
        uint256 eventId = _eventIds.current();

        createdTokens[eventId].owner = msg.sender;
        createdTokens[eventId].uri = tokenURI;
        issuedTokens[eventId][to].issued = true;
        createdTokens[eventId].restricted = true;
        createdTokens[eventId].burnAuth = _burnAuth;
    }

    // Pre-issued tokens
    function createToken(string memory tokenURI, address[] memory to, BurnAuth _burnAuth) public {
        _eventIds.increment();
        uint256 eventId = _eventIds.current();

        createdTokens[eventId].owner = msg.sender;
        createdTokens[eventId].uri = tokenURI;

        for (uint256 i = 0; i < to.length; ++i) {
            issuedTokens[eventId][to[i]].issued = true;
        }
        createdTokens[eventId].restricted = true;
        createdTokens[eventId].burnAuth = _burnAuth;
    }

    // Mint tokens
    function claimToken(uint256 eventId) public returns (uint256) {
        require(createdTokens[eventId].restricted == false, "Restricted token");
        require(createdTokens[eventId].limit > createdTokens[eventId].count, "Token claim limit reached");

        createdTokens[eventId].count += 1;

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, createdTokens[eventId].uri);

        emit ClaimToken(msg.sender, tokenId);

        return tokenId;
    }

    // Mint issued token
    function claimIssuedToken(uint256 eventId) public returns (uint256) {
        require(createdTokens[eventId].restricted, "Not a restricted token");
        require(issuedTokens[eventId][msg.sender].issued, "Token must be issued to you");

        issuedTokens[eventId][msg.sender].issued = false;
        createdTokens[eventId].count += 1;

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, createdTokens[eventId].uri);


        emit ClaimToken(msg.sender, tokenId);

        return tokenId;
    }

    function incraseLimit(uint256 eventId, uint256 limit) public {
        require(createdTokens[eventId].owner == msg.sender, "Must be event owner");
        require(createdTokens[eventId].limit < limit, "Limit must be higher");

        createdTokens[eventId].limit = limit;
    }

    function burnToken(uint256 tokenId, uint256 eventId) public onlyBurnAuth(tokenId, eventId) {
        _burn(tokenId);
    }
}
