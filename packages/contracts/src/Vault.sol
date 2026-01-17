// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Vault {
    mapping(address => uint256) public balances;
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event YieldCompounded(uint256 amount);

    // Mock token interface for simplicity (in production use IERC20)
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }

    // Function for the AI Agent to call
    function compound() public {
        // In a real implementation, this would:
        // 1. Claim rewards from Aave/Compound
        // 2. Swap tokens
        // 3. Re-supply
        
        // For simulation, we just emit an event
        emit YieldCompounded(block.timestamp);
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
