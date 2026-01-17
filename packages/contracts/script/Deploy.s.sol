// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Vault.sol";

contract DeployVault is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        Vault vault = new Vault();

        vm.stopBroadcast();
        
        console.log("Vault deployed at:", address(vault));
    }
}
