import { MarinadeScanner } from './MarinadeScanner.js';
import { KaminoScanner } from './KaminoScanner.js';
import { YieldOpportunity } from './MarinadeScanner.js';

export class OpportunityAggregator {
    private marinadeScanner: MarinadeScanner;
    private kaminoScanner: KaminoScanner;

    constructor() {
        this.marinadeScanner = new MarinadeScanner();
        this.kaminoScanner = new KaminoScanner();
    }

    async scanAll(): Promise<YieldOpportunity[]> {
        console.log('🌊 Starting comprehensive DeFi scan...');

        const [marinadeOpps, kaminoOpps] = await Promise.all([
            this.marinadeScanner.scan(),
            this.kaminoScanner.scan()
        ]);

        const allOpportunities = [...marinadeOpps, ...kaminoOpps];

        // Sort by APY (highest first)
        const sorted = allOpportunities.sort((a, b) => b.apy - a.apy);

        console.log(`\n📊 Found ${sorted.length} opportunities`);
        console.log('Top 5:');
        sorted.slice(0, 5).forEach((opp, i) => {
            console.log(`${i + 1}. ${opp.protocol} - ${opp.name}: ${opp.apy}% APY (${opp.risk} risk)`);
        });

        return sorted;
    }

    /**
     * Filter opportunities by criteria
     */
    filter(opportunities: YieldOpportunity[], criteria: {
        minAPY?: number;
        maxRisk?: 'low' | 'medium' | 'high';
        minTVL?: number;
        types?: ('staking' | 'lending' | 'liquidity' | 'farming')[];
    }): YieldOpportunity[] {
        return opportunities.filter(opp => {
            if (criteria.minAPY && opp.apy < criteria.minAPY) return false;
            if (criteria.minTVL && opp.tvl < criteria.minTVL) return false;
            if (criteria.types && !criteria.types.includes(opp.type)) return false;
            if (criteria.maxRisk) {
                const riskLevels = { low: 1, medium: 2, high: 3 };
                const maxLevel = riskLevels[criteria.maxRisk];
                const oppLevel = riskLevels[opp.risk];
                if (oppLevel > maxLevel) return false;
            }
            return true;
        });
    }
}
