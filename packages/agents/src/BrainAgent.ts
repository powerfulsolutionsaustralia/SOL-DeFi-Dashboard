import OpenAI from 'openai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export class BrainAgent {
    private openai: OpenAI;
    private supabase: SupabaseClient;

    constructor() {
        const xaiKey = process.env.XAI_API_KEY;
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_KEY!;

        if (!xaiKey) {
            console.warn("⚠️ NO XAI_API_KEY Found. Brain will be offline.");
        }

        // xAI uses the OpenAI SDK format
        this.openai = new OpenAI({
            apiKey: xaiKey || 'missing',
            baseURL: 'https://api.x.ai/v1',
        });

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async analyzeStrategy(marketData: any, walletState: any) {
        if (!process.env.XAI_API_KEY) {
            return { advice: "Brain is in offline mode. Please add XAI_API_KEY.", action: "HOLD" };
        }

        console.log("🧠 Brain is thinking (Consulting xAI)...");

        // Log AI consultation start
        await this.supabase.from('agent_actions').insert({
            agent_name: 'BrainAgent',
            action_type: 'BRAIN_THINKING',
            details: { status: 'Consulting xAI for strategy...', model: 'grok-4-1-fast-reasoning' }
        });

        const prompt = `
        You are a DeFi Strategy Expert on the Solana Network. 
        Your goal is to maximize wealth using the Compound Effect.
        
        Current Wallet: ${JSON.stringify(walletState)}
        Current Market (Jupiter): ${JSON.stringify(marketData)}
        
        Provide:
        1. A concise strategy advice for the user (Educational).
        2. A clear pathway (e.g., SOL -> USDC -> SOL Staking).
        3. A recommended action: [SWAP, STAKE, HOLD].
        
        Respond in JSON format: { "advice": "", "pathway": "", "action": "" }
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                model: "grok-4-1-fast-reasoning", // Upgraded to latest fast reasoning model
                messages: [
                    { role: "system", content: "You are a professional Solana DeFi advisor." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

            // Log decision to Supabase for the Dashboard to see
            await this.supabase.from('agent_actions').insert({
                agent_name: 'BrainAgent',
                action_type: 'STRATEGY_DECISION',
                details: result
            });

            return result;
        } catch (error: any) {
            console.error("❌ Brain Error:", error.message);
            return { advice: "Failed to consult xAI.", action: "HOLD" };
        }
    }
}
