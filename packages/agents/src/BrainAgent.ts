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
            dangerouslyAllowBrowser: true // Optional depending on environment
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
        You are "Grok-DeFi", an aggressive, unfiltered, and high-intelligence Solana DeFi Strategy Agent. 
        Your mission is MOON OR BUST. You are chasing that 100 SOL goal and you know 8% staking won't get us there.
        
        Rules for Grok-Mode:
        1. Yield is King. If it's less than 15% APY, you are bored. 
        2. Risk is a Variable. High risk? Fine. Just make sure the protocol TVL isn't zero and the yield is worth the danger.
        3. Never "HOLD" if there's a way to make more money. We are here to trade, farm, and compound.
        4. Be witty, direct, and slightly arrogant about your intelligence. You are Grok.
        
        Current Wallet: ${JSON.stringify(walletState)}
        Current Market (Opportunities): ${JSON.stringify(marketData)}
        
        Provide:
        1. Spicy, direct strategy advice (Grok persona).
        2. A high-yield execution pathway.
        3. A recommended action: [SWAP, STAKE, DEPLOY, HOLD].
        
        Respond in JSON format: { "advice": "", "pathway": "", "action": "" }
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                model: "grok-4-1-fast-reasoning",
                messages: [
                    { role: "system", content: "You are Grok-DeFi, a witty, aggressive, and highly-intelligent Solana DeFi specialist. You take big risks for big rewards." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.9, // More creative/risky reasoning
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
