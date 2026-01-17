import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bs58 from 'bs58';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';
import { BrainAgent } from './BrainAgent.js';

dotenv.config();

// Jupiter API Endpoint
const JUPITER_QUOTE_API = 'https://public.jupiterapi.com/quote';

export class SolanaAgent {
    private connection: Connection;
    private wallet: Keypair;
    private supabase: SupabaseClient;
    private brain: BrainAgent;

    constructor() {
        this.brain = new BrainAgent();
        // Initialize Supabase
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase credentials");
        }
        this.supabase = createClient(supabaseUrl, supabaseKey);

        // Initialize Solana Connection
        this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

        // Initialize Wallet
        const privateKey = process.env.SOLANA_PRIVATE_KEY;
        if (!privateKey) {
            console.warn("⚠️ NO SOLANA PRIVATE KEY FOUND. Agent is in READ-ONLY mode.");
            this.wallet = Keypair.generate();
        } else {
            try {
                const decoded = bs58.decode(privateKey);
                this.wallet = Keypair.fromSecretKey(decoded);
                console.log(`✅ Wallet Loaded: ${this.wallet.publicKey.toBase58()}`);
            } catch (e) {
                console.error("❌ Failed to load private key. Check format (Base58 required).");
                this.wallet = Keypair.generate();
            }
        }
    }

    async start() {
        console.log("🚀 Solana Agent Starting...");
        console.log(`Watching Wallet: ${this.wallet.publicKey.toBase58()}`);

        const solBalance = await this.checkBalance();
        if (solBalance && solBalance > 0.05) {
            await this.scanJupiterYields();
        }

        // Scan every 30 seconds
        setInterval(async () => {
            const solBalance = await this.checkBalance();
            if (solBalance && solBalance > 0.05) {
                await this.scanJupiterYields();
            } else {
                console.log("💤 Balance too low to trade. Minimum 0.05 SOL recommended.");
            }
        }, 30000);
    }

    async checkBalance() {
        try {
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            const solBalance = balance / LAMPORTS_PER_SOL;
            console.log(`💰 Current Balance: ${solBalance.toFixed(4)} SOL`);

            await this.supabase.from('agent_actions').insert({
                agent_name: 'SolanaAgent',
                action_type: 'BALANCE_CHECK',
                details: { address: this.wallet.publicKey.toBase58(), balance: solBalance }
            });

            return solBalance;
        } catch (error: any) {
            console.error("Error checking balance:", error.message);
        }
    }

    async scanJupiterYields() {
        console.log("🔍 Scanning Jupiter for best SOL -> USDC rates...");

        const inputMint = 'So11111111111111111111111111111111111111112';
        const outputMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
        const amount = 100000000; // 0.1 SOL

        try {
            const url = `${JUPITER_QUOTE_API}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
            const response = await fetch(url);
            const quote = await response.json();

            if (quote && quote.outAmount) {
                const outAmountUSDC = quote.outAmount / 1000000;
                console.log(`📈 Current Rate: 0.1 SOL = ${outAmountUSDC.toFixed(2)} USDC`);

                await this.supabase.from('yield_reports').insert({
                    protocol: 'Jupiter',
                    chain: 'Solana',
                    token: 'SOL -> USDC',
                    apy: outAmountUSDC, // For display purposes, use the price as "APY" or rate
                    created_at: new Date().toISOString()
                });

                // CONSULT THE BRAIN
                const advice = await this.brain.analyzeStrategy(
                    { quote, outAmountUSDC, rate: (outAmountUSDC * 10) },
                    { address: this.wallet.publicKey.toBase58(), balance: (await this.connection.getBalance(this.wallet.publicKey)) / LAMPORTS_PER_SOL }
                );

                console.log(`🧠 Brain Advice: ${advice.advice}`);
                console.log(`🚀 Pathway: ${advice.pathway}`);

                if (advice.action === 'SWAP') {
                    console.log("⚡ Executing Swap based on AI Advice...");
                    // await this.executeSwap(quote);
                }
            }

        } catch (error: any) {
            console.error("Error fetching Jupiter quote:", error.message);
        }
    }

    async executeSwap(quoteResponse: any) {
        if (!process.env.SOLANA_PRIVATE_KEY) {
            console.error("❌ Cannot execute swap: Private Key missing.");
            return;
        }

        try {
            console.log("⚡ Fetching swap transaction from Jupiter...");
            const response = await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey: this.wallet.publicKey.toBase58(),
                    wrapAndUnwrapSol: true
                })
            });

            const { swapTransaction } = await response.json();

            const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
            transaction.sign([this.wallet]);

            const rawTransaction = transaction.serialize();
            const txid = await this.connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2
            });

            console.log(`✅ SUCCESS: Swap Executed. TXID: ${txid}`);

            await this.supabase.from('agent_actions').insert({
                agent_name: 'SolanaAgent',
                action_type: 'SWAP_EXECUTION',
                details: { txid, quote: quoteResponse }
            });

        } catch (error: any) {
            console.error("❌ Swap Execution Error:", error.message);
        }
    }
}
