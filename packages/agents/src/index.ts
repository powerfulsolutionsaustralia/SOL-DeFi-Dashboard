import dotenv from 'dotenv';
import { SolanaAgent } from './SolanaAgent.js';

dotenv.config();

async function main() {
    console.log("🚀 Starting DeFi Agents (Solana Mode)...");

    // Solana Agent (The New Direction)
    const solanaAgent = new SolanaAgent();
    await solanaAgent.start();
}

main().catch(console.error);
