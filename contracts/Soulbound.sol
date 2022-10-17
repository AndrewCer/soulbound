// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Enums.sol";

import "hardhat/console.sol";

/**
 * @dev Soulbound (aka non-transferable) ERC721 token with storage based token URI management.
 */
contract Soulbound is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    BurnAuth public burnAuth;
    mapping(address => bool) public issuedTokens;

    constructor(BurnAuth _burnAuth) ERC721("Soulbound", "Bound") {
        burnAuth = _burnAuth;
    }

    modifier onlyBurnAuth(uint256 tokenId) {
        if (burnAuth == BurnAuth.OwnerOnly) {
            require(msg.sender == ownerOf(tokenId), "Only owner may burn");
        }
        if (burnAuth == BurnAuth.IssuerOnly) {
            require(msg.sender == owner(), "Only issuer may burn");
        }
        if (burnAuth == BurnAuth.Both) {
            require(
                msg.sender == owner() || msg.sender == ownerOf(tokenId),
                "Only issuer or owner may burn"
            );
        }
        if (burnAuth == BurnAuth.Neither) {
            require(true, "Burn not allowed");
        }
        _;
    }

    function issueToken(address to) external onlyOwner {
        issuedTokens[to] = true;
    }

    function bulkIssue(address[] calldata to) external onlyOwner {
        for (uint256 i = 0; i < to.length; i++) {
            issuedTokens[to[i]] = true;
        }
    }

    function claimToken(string memory tokenURI) public returns (uint256) {
        require(issuedTokens[msg.sender], "Token is not issued");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // personToToken[msg.sender] = tokenURI;
        issuedTokens[msg.sender] = false;

        return newItemId;
    }

    function burnToken(uint256 tokenId) public onlyBurnAuth(tokenId) {
        _burn(tokenId);
    }
}
