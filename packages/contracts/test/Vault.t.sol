// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Vault.sol";

contract VaultTest is Test {
    Vault public vault;

    function setUp() public {
        vault = new Vault();
    }

    function testDeposit() public {
        vm.deal(address(this), 10 ether);
        vault.deposit{value: 1 ether}();
        assertEq(vault.balances(address(this)), 1 ether);
        assertEq(address(vault).balance, 1 ether);
    }

    function testWithdraw() public {
        vm.deal(address(this), 10 ether);
        vault.deposit{value: 2 ether}();
        
        vault.withdraw(1 ether);
        assertEq(vault.balances(address(this)), 1 ether);
        assertEq(address(vault).balance, 1 ether);
    }

    function testCompoundEvent() public {
        // Expect the event
        vm.expectEmit(false, false, false, true);
        emit Vault.YieldCompounded(block.timestamp);
        
        vault.compound();
    }
}
