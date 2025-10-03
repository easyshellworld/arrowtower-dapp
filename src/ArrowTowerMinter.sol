// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ArrowTowerVillageNFT.sol";

/**
 * @title ArrowTowerMinter
 * @dev Mints NFT after verifying user completed the tour
 */
contract ArrowTowerMinter is Ownable {
    ArrowTowerVillageNFT public nftContract;

    // 标记用户是否已完成完整路线
    mapping(address => bool) public hasCompletedTour;

    // 事件：用户完成路线
    event TourCompleted(address user);
    event NFTMinted(address user, uint256 tokenId);

    constructor(address _nftContract) Ownable(msg.sender) {
        require(_nftContract != address(0), "Invalid NFT contract");
        nftContract = ArrowTowerVillageNFT(_nftContract);
    }

    /**
     * @dev 外部调用：标记用户完成路线（由后端或前端触发验证）
     * 实际生产中，这里应有更复杂的验证（如签名、zk-proof、地理围栏等）
     */
    function completeTour(address user) external onlyOwner {
        require(!hasCompletedTour[user], "User already completed tour");

        hasCompletedTour[user] = true;
        emit TourCompleted(user);
    }

    /**
     * @dev 铸造 NFT（由系统自动调用）
     */
    function mintNFT(address user) external onlyOwner {
        require(hasCompletedTour[user], "User hasn't completed tour");
        require(nftContract.balanceOf(user) == 0, "User already has NFT"); // 可选：防止重复铸造

        uint256 tokenId = nftContract.mint(user);
        emit NFTMinted(user, tokenId);
    }

    /**
     * @dev 紧急转移所有权（可选）
     */
    function setNFTContract(address _nft) external onlyOwner {
        require(_nft != address(0));
        nftContract = ArrowTowerVillageNFT(_nft);
    }
}