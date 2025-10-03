// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ArrowTowerVillageNFT.sol";
import "../src/ArrowTowerMinter.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ArrowTowerVillageNFT nft = new ArrowTowerVillageNFT();
        ArrowTowerMinter minter = new ArrowTowerMinter(address(nft));

        // ✅ 关键：绑定 Minter 到 NFT 合约
        nft.setMinterContract(address(minter));

        console.log("NFT deployed at:", address(nft));
        console.log("Minter deployed at:", address(minter));

        vm.stopBroadcast();
    }
}