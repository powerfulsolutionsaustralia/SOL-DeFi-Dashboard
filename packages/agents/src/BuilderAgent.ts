import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';

dotenv.config();
const execAsync = util.promisify(exec);

export class BuilderAgent {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        this.supabase = createClient(supabaseUrl!, supabaseKey!);
    }

    async start() {
        console.log("👷 Builder Agent is active. Monitoring codebase...");

        // Simulation: Every minute, run tests and check for gas optimizations
        setInterval(async () => {
            await this.runHealthCheck();
            await this.analyzeCode();
        }, 30000); // Speed up for demo (30s)
    }

    async runHealthCheck() {
        console.log("\n[BUILDER] Running Health Check (Forge Tests)...");
        try {
            // Running foundry tests from the root or contract dir
            const { stdout, stderr } = await execAsync('cd ../contracts && ~/.foundry/bin/forge test');
            console.log(stdout);

            if (stderr) console.warn("Warnings:", stderr);

            console.log("✅ Tests Passed. System is healthy.");

            // Log health to Supabase
            await this.supabase.from('agent_actions').insert({
                agent_name: 'Builder',
                action_type: 'TEST_RUN',
                details: { result: 'PASS', output: stdout.slice(0, 200) }
            });

        } catch (error: any) {
            console.error("❌ Tests Failed!", error.message);
            await this.supabase.from('agent_actions').insert({
                agent_name: 'Builder',
                action_type: 'TEST_RUN',
                details: { result: 'FAIL', error: error.message }
            });
        }
    }

    async analyzeCode() {
        console.log("[BUILDER] Analyzing Vault.sol for Gas Optimizations...");

        await new Promise(r => setTimeout(r, 2000)); // Simulate analysis time

        const optimization = {
            file: 'Vault.sol',
            suggestion: 'Use unchecked { } block for balance subtraction to save gas (Solidity 0.8+ has built-in overflow checks).',
            access: 'balances[msg.sender] -= amount;',
            estimated_savings: '200 gas per withdraw'
        };

        console.log(`💡 Optimization Found: ${optimization.suggestion}`);

        await this.supabase.from('agent_actions').insert({
            agent_name: 'Builder',
            action_type: 'CODE_PROPOSAL',
            details: optimization
        });
    }
}
