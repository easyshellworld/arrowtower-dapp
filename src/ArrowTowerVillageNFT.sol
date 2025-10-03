// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ✅ 手动定义 Counters 库（因为 OZ 5.x 删除了它）
library Counters {
    struct Counter {
        uint256 _value;
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        counter._value += 1;
    }

    function reset(Counter storage counter) internal {
        counter._value = 0;
    }
}

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title ArrowTowerVillageNFT
 * @dev ERC721 NFT for Arrow Tower Village tourism
 * Only the minter contract can call mint()
 */
contract ArrowTowerVillageNFT is ERC721, Ownable {
    using Counters for Counters.Counter;

    // Token ID 自增器
    Counters.Counter private _tokenIdCounter;

    // 允许调用 mint 的代理合约地址
    address public minterContract;

    // 存储每个地址拥有的 tokenId（可选，ERC721 已有 ownerOf，但方便前端查询）
    mapping(address => uint256[]) public tokensOfOwner;

    // 事件：记录铸造
    event Minted(address indexed to, uint256 tokenId);

    constructor() ERC721("ArrowTowerVillage", "ATV") Ownable(msg.sender) {}

    /**
     * @dev 设置 Minter 合约地址（仅 Owner 可调用）
     */
    function setMinterContract(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid address");
        minterContract = _minter;
    }

    /**
     * @dev 仅 Minter 合约可以调用此函数
     */
    modifier onlyMinter() {
        require(msg.sender == minterContract, "Caller is not the minter");
        _;
    }

    /**
     * @dev 铸造 NFT（仅 Minter 可调用）
     * @param to 接收 NFT 的用户地址
     * @return tokenId 新铸造的 token ID
     */
    function mint(address to) external onlyMinter returns (uint256) {
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _tokenIdCounter.increment();

        // 记录用户拥有的 tokenId
        tokensOfOwner[to].push(tokenId);

        emit Minted(to, tokenId);
        return tokenId;
    }

    /**
     * @dev 获取用户所有 tokenId（前端可用）
     */
    function getTokensOfOwner(address owner) external view returns (uint256[] memory) {
        return tokensOfOwner[owner];
    }

    /**
     * @dev 获取当前 tokenId 编号（下一个将要铸造的 ID）
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev OpenZeppelin: 支持 ERC721 接口
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}