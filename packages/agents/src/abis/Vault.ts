export const VaultABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Deposit",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Withdraw",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "YieldCompounded",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "balances",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "compound",
        "outputs": []
    },
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "function",
        "name": "deposit",
        "outputs": []
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "getBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "outputs": []
    }
] as const;
