import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import bs58 from 'bs58';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';
import { BrainAgent } from './BrainAgent.js';
import { GoalEngine } from './GoalEngine.js';
import { OpportunityAggregator } from './scanners/OpportunityAggregator.js';

dotenv.config();

// Jupiter API Endpoint
const JUPITER_QUOTE_API = 'https://public.jupiterapi.com/quote';

export class SolanaAgent {
    private connection: Connection;
    private wallet: Keypair;
    private supabase: SupabaseClient;
    private brain: BrainAgent;
    private goalEngine: GoalEngine;
    private opportunityAggregator: OpportunityAggregator;
    private currentBalance: number = 0;
    private currentAPY: number = 8.4; // Track estimated APY

    constructor() {
        this.brain = new BrainAgent();
        this.goalEngine = new GoalEngine();
        this.opportunityAggregator = new OpportunityAggregator();
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
            await this.scanDeFiYields();
        }

        // Scan every 5 minutes (changed from 30 seconds for DeFi)
        setInterval(async () => {
            const solBalance = await this.checkBalance();
            if (solBalance && solBalance > 0.05) {
                await this.scanDeFiYields();
            } else {
                console.log("💤 Balance too low to farm. Minimum 0.05 SOL recommended.");
            }
        }, 300000); // 5 minutes
    }

    async checkBalance() {
        try {
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            const solBalance = balance / LAMPORTS_PER_SOL;
            this.currentBalance = solBalance;
            console.log(`💰 Current Balance: ${solBalance.toFixed(4)} SOL`);

            await this.supabase.from('agent_actions').insert({
                agent_name: 'SolanaAgent',
                action_type: 'BALANCE_CHECK',
                details: { address: this.wallet.publicKey.toBase58(), balance: solBalance }
            });

            // Update financial goal with current APY
            const goal = await this.goalEngine.updateGoal(solBalance, this.currentAPY);
            if (goal) {
                console.log(`🎯 Goal Progress: ${solBalance.toFixed(4)} / ${goal.target_sol} SOL`);
                console.log(`📅 Projected Timeline: ${goal.days_to_goal} days to reach goal at ${this.currentAPY}% APY`);
            }

            return solBalance;
        } catch (error: any) {
            console.error("Error checking balance:", error.message);
        }
    }

    async scanDeFiYields() {
        console.log("🌊 Scanning DeFi protocols for yield opportunities...");

        try {
            // Get all opportunities from all protocols
            const opportunities = await this.opportunityAggregator.scanAll();

            // Filter to only safe, high-yield opportunities
            const filtered = this.opportunityAggregator.filter(opportunities, {
                minAPY: 5,
                maxRisk: 'medium',
                minTVL: 1000000 // $1M minimum TVL
            });

            // Log top opportunities to Supabase
            for (const opp of filtered.slice(0, 5)) {
                await this.supabase.from('yield_reports').insert({
                    protocol: opp.protocol,
                    chain: 'Solana',
                    token: opp.name,
                    apy: opp.apy,
                    created_at: new Date().toISOString()
                });
            }

            if (filtered.length > 0) {
                // Ask xAI Brain to analyze and select best opportunity
                const decision = await this.brain.analyzeStrategy(
                    { opportunities: filtered.slice(0, 10), currentBalance: this.currentBalance },
                    { address: this.wallet.publicKey.toBase58(), balance: this.currentBalance }
                );

                console.log(`🧠 Brain's DeFi Recommendation: ${decision.advice}`);
                console.log(`💡 Selected Protocol: ${decision.pathway}`);

                // Update current APY based on selected opportunity
                const topOpp = filtered[0];
                this.currentAPY = topOpp.apy;

                // TODO: Execute deployment to selected protocol
                // For now, just log the decision
                if (decision.action === 'DEPLOY') {
                    console.log(`⚡ Brain says DEPLOY to: ${decision.pathway}`);
                    // await this.deployToDeFi(topOpp);
                } else {
                    console.log(`🛡️ Brain says HOLD. Monitoring for better opportunity...`);
                }
            } else {
                console.log("⚠️ No suitable yield opportunities found meeting criteria.");
            }

        } catch (error: any) {
            console.error("❌ DeFi scan error:", error.message);
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

                // CONSULT THE BRAIN (Intelligence Feed)
                const decision = await this.brain.analyzeStrategy(
                    { quote, outAmountUSDC, rate: (outAmountUSDC * 10) },
                    { address: this.wallet.publicKey.toBase58(), balance: (await this.connection.getBalance(this.wallet.publicKey)) / LAMPORTS_PER_SOL }
                );

                console.log(`🧠 Brain Advice: ${decision.advice}`);
                console.log(`🚀 Pathway: ${decision.pathway}`);

                // FLIP THE SWITCH: Live Trading Enabled
                if (decision.action === 'SWAP') {
                    console.log("⚡ Brain says SWAP! Executing autonomous trade...");
                    await this.executeSwap(quote);
                } else {
                    console.log("🛡️ Brain says HOLD. Monitoring for next opportunity...");
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
