import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

interface Goal {
    id?: string;
    target_sol: number;
    current_sol: number;
    target_apy: number;
    days_to_goal: number;
    status: 'active' | 'achieved' | 'paused';
    created_at?: string;
}

export class GoalEngine {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_KEY!;
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Calculate days to reach goal using compound interest formula
     * A = P(1 + r)^t where:
     * A = target amount
     * P = principal (current balance)
     * r = daily rate (APY / 365)
     * t = time in days
     */
    calculateDaysToGoal(currentBalance: number, targetBalance: number, apyPercent: number): number {
        if (currentBalance >= targetBalance) return 0;
        if (apyPercent <= 0) return Infinity;

        const dailyRate = apyPercent / 100 / 365;
        const days = Math.log(targetBalance / currentBalance) / Math.log(1 + dailyRate);

        return Math.ceil(days);
    }

    /**
     * Project future balance after N days with compound interest
     */
    projectBalance(currentBalance: number, apyPercent: number, days: number): number {
        const dailyRate = apyPercent / 100 / 365;
        return currentBalance * Math.pow(1 + dailyRate, days);
    }

    /**
     * Update or create the main goal
     */
    async updateGoal(currentBalance: number, currentAPY: number) {
        const targetSOL = 1.0; // Default goal: grow to 1 SOL
        const daysToGoal = this.calculateDaysToGoal(currentBalance, targetSOL, currentAPY);

        const goal: Goal = {
            target_sol: targetSOL,
            current_sol: currentBalance,
            target_apy: currentAPY,
            days_to_goal: daysToGoal,
            status: currentBalance >= targetSOL ? 'achieved' : 'active'
        };

        // Upsert the goal (update if exists, insert if not)
        const { data, error } = await this.supabase
            .from('goals')
            .upsert(goal, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error updating goal:', error);
            return null;
        }

        return data;
    }

    /**
     * Get current active goal
     */
    async getActiveGoal(): Promise<Goal | null> {
        const { data, error } = await this.supabase
            .from('goals')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Calculate compound earnings over time
     */
    calculateCompoundEarnings(principal: number, apyPercent: number, days: number) {
        const futureBalance = this.projectBalance(principal, apyPercent, days);
        const earnings = futureBalance - principal;
        const roi = ((futureBalance - principal) / principal) * 100;

        return {
            futureBalance,
            earnings,
            roi,
            days,
            dailyEarning: earnings / days
        };
    }

    /**
     * Log goal progress
     */
    async logProgress(currentBalance: number, earnedToday: number, currentAPY: number) {
        await this.supabase.from('agent_actions').insert({
            agent_name: 'GoalEngine',
            action_type: 'GOAL_PROGRESS',
            details: {
                current_balance: currentBalance,
                earned_today: earnedToday,
                current_apy: currentAPY,
                timestamp: new Date().toISOString()
            }
        });
    }
}
