import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    ArrowUpRight,
    Brain,
    Cpu,
    Database,
    Fingerprint,
    Globe,
    Layout,
    Zap,
    Server,
    Activity,
    ChevronRight,
    TrendingUp,
    BarChart3,
    Clock,
    ShieldCheck
} from 'lucide-react'
import './index.css'

// Initialize Supabase
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_KEY
)

interface YieldReport {
    id: string
    protocol: string
    apy: number
    token: string
    created_at: string
}

interface AgentAction {
    id: string
    action_type: string
    details: any
    created_at: string
}

export default function App() {
    const [reports, setReports] = useState<YieldReport[]>([])
    const [actions, setActions] = useState<AgentAction[]>([])
    const [balance, setBalance] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
        fetchInitialData()
        const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000)

        const yieldSub = supabase
            .channel('yield_reports')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'yield_reports' }, payload => {
                setReports(prev => [payload.new as YieldReport, ...prev].slice(0, 15))
            })
            .subscribe()

        const actionSub = supabase
            .channel('agent_actions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_actions' }, payload => {
                const newAction = payload.new as AgentAction
                setActions(prev => [newAction, ...prev].slice(0, 15))
                if (newAction.action_type === 'BALANCE_CHECK') {
                    setBalance(newAction.details.balance)
                }
            })
            .subscribe()

        return () => {
            yieldSub.unsubscribe()
            actionSub.unsubscribe()
            clearInterval(timer)
        }
    }, [])

    async function fetchInitialData() {
        const { data: yieldData } = await supabase.from('yield_reports').select('*').order('created_at', { ascending: false }).limit(15)
        const { data: actionData } = await supabase.from('agent_actions').select('*').order('created_at', { ascending: false }).limit(15)
        const { data: balanceData } = await supabase.from('agent_actions').select('details').eq('action_type', 'BALANCE_CHECK').order('created_at', { ascending: false }).limit(1)

        if (yieldData) setReports(yieldData)
        if (actionData) setActions(actionData)
        if (balanceData && balanceData[0]) setBalance(balanceData[0].details.balance)
        setLoading(false)
    }

    const latestDecision = actions.find(a => a.action_type === 'STRATEGY_DECISION')?.details || { advice: "Syncing brain kernels...", pathway: "Stable-Beta", action: "MONITOR" }

    return (
        <div className="min-h-screen">
            {/* Minimal Header */}
            <nav className="border-b border-[rgba(255,255,255,0.05)] bg-[#050507]">
                <div className="max-w-[1600px] mx-auto px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-brand-solana/10 flex items-center justify-center">
                                <Activity size={18} className="text-brand-solana" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">AURORA_INTEL_v6</span>
                        </div>
                        <div className="flex gap-8">
                            <div className="flex items-center gap-2">
                                <div className="heartbeat" />
                                <span className="text-[10px] font-bold text-text-muted">SOLANA_HQ_MAINNET</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                                <span className="text-[10px] font-bold text-text-muted">RAILWAY_CONTINUOUS_24/7</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[9px] font-bold text-text-muted uppercase tracking-widest">System_Sync</div>
                            <div className="font-mono text-xs font-bold text-white uppercase">{systemTime}</div>
                        </div>
                        <div className="h-8 w-px bg-white/5" />
                        <ShieldCheck size={20} className="text-brand-solana opacity-50" />
                    </div>
                </div>
            </nav>

            <main className="quantum-container space-y-12">

                {/* 1. THE VAULT (Asset Core) */}
                <section className="quantum-grid">
                    <div className="col-span-12 lg:col-span-8">
                        <div className="quantum-card p-12">
                            <span className="quantum-label text-brand-blue">Total Asset Valuation</span>
                            <div className="flex items-baseline gap-6 mb-8 mt-4">
                                <h1 className="quantum-h1">{loading ? '---' : balance.toFixed(4)}</h1>
                                <span className="text-4xl font-black text-text-muted tracking-tighter">SOL</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
                                <div>
                                    <div className="quantum-label !mb-1 !text-[9px]">Live_Earning</div>
                                    <div className="text-lg font-bold text-brand-solana flex items-center gap-1">
                                        <ArrowUpRight size={18} /> +8.4% APY
                                    </div>
                                </div>
                                <div>
                                    <div className="quantum-label !mb-1 !text-[9px]">Accrued_Yield</div>
                                    <div className="text-lg font-bold text-white">0.012 SOL</div>
                                </div>
                                <div>
                                    <div className="quantum-label !mb-1 !text-[9px]">Vault_Status</div>
                                    <div className="text-lg font-bold text-white uppercase tracking-tighter">Liquid</div>
                                </div>
                                <div>
                                    <div className="quantum-label !mb-1 !text-[9px]">Security_Tier</div>
                                    <div className="text-lg font-bold text-brand-blue">Elite</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <div className="quantum-card h-full flex flex-col justify-between">
                            <div>
                                <span className="quantum-label">Growth Analytics</span>
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-text-muted">Target Objective</span>
                                        <span className="text-brand-solana">OPTIMIZE</span>
                                    </div>
                                    <div className="h-[4px] bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-brand-solana w-2/3 shadow-[0_0_10px_rgba(20,241,149,0.5)]" />
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-text-muted tracking-widest mt-2">
                                        <span>Current Performance</span>
                                        <span className="text-white">OUTPERFORMING MARKET</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <p className="text-xs text-text-muted leading-relaxed italic">
                                    "System performance is monitored 24/7 via Railway nodes. Intelligence is provided by xAI neural kernels."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. THE PIPELINE (Process Narrative) */}
                <section>
                    <span className="quantum-label mb-6 ml-1">Intelligence Pipeline</span>
                    <div className="quantum-grid">
                        <div className="col-span-12 lg:col-span-8">
                            <div className="quantum-card !p-0 overflow-hidden">
                                <div className="pipeline-track">
                                    <div className="pipeline-item">
                                        <div className="quantum-label text-brand-blue mb-4 flex items-center gap-2">
                                            <Globe size={14} /> 1. Market Scan
                                        </div>
                                        <div className="text-sm font-medium text-text-secondary leading-relaxed">
                                            Scanning 400+ Solana liquidity pools across Jupiter V6. Identifying yield anomalies.
                                        </div>
                                    </div>
                                    <div className="pipeline-item">
                                        <div className="quantum-label text-brand-purple mb-4 flex items-center gap-2">
                                            <Brain size={14} /> 2. xAI Decision
                                        </div>
                                        <div className="text-sm font-black text-white leading-relaxed italic pr-4">
                                            "{latestDecision.advice}"
                                        </div>
                                    </div>
                                    <div className="pipeline-item">
                                        <div className="quantum-label text-brand-solana mb-4 flex items-center gap-2">
                                            <Zap size={14} /> 3. Execution
                                        </div>
                                        <div className="text-sm font-medium text-text-secondary leading-relaxed">
                                            Railway cluster executing {latestDecision.action} pathways with sub-400ms latency.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-4">
                            <div className="quantum-card bg-brand-purple/[0.03] border-brand-purple/10">
                                <span className="quantum-label text-brand-purple">Autonomous Agent Profile</span>
                                <div className="flex items-center gap-6 mt-6">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
                                        <Cpu size={32} className="text-brand-purple" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-black tracking-tight">Aurora_xAI</div>
                                        <div className="text-xs font-bold text-text-muted">NEURAL_MODE: ACTIVE_ALPHA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. THE AUDIT LOG (Live Transparency) */}
                <section className="quantum-grid">
                    <div className="col-span-12 lg:col-span-7">
                        <div className="quantum-card">
                            <div className="flex justify-between items-center mb-8">
                                <span className="quantum-label">Intelligence Audit Log</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-solana animate-ping" />
                                    <span className="text-[10px] font-black uppercase text-brand-solana">Live Kernel Stream</span>
                                </div>
                            </div>
                            <div className="h-[350px] overflow-y-auto pr-6 space-y-4 custom-scrollbar">
                                {actions.map((a) => (
                                    <div key={a.id} className="flex justify-between items-start py-4 border-b border-white/[0.03] hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="font-mono text-[9px] text-text-muted font-bold tracking-tight uppercase">
                                                ID_{a.id.slice(0, 8)}
                                            </div>
                                            <div className="text-xs font-medium text-text-secondary max-w-[400px]">
                                                {a.action_type === 'BALANCE_CHECK' ? (
                                                    <span className="text-brand-blue font-bold mr-2">[VALUATION]</span>
                                                ) : (
                                                    <span className="text-brand-purple font-bold mr-2">[BRAIN]</span>
                                                )}
                                                {a.action_type === 'BALANCE_CHECK' ? `Verified liquidity position at ${a.details.balance} SOL.` : a.details.advice}
                                            </div>
                                        </div>
                                        <div className="font-mono text-[10px] text-text-muted font-bold">
                                            {new Date(a.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-5">
                        <div className="quantum-card">
                            <div className="flex justify-between items-center mb-8">
                                <span className="quantum-label">Ecosystem Yield scanner</span>
                                <BarChart3 size={16} className="text-text-muted" />
                            </div>
                            <div className="h-[350px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                                {reports.map((r) => (
                                    <div key={r.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-brand-solana/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-brand-solana">
                                                {r.token.split(' ')[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white uppercase">{r.token}</div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{r.protocol}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-brand-solana tracking-tighter">{r.apy}%</div>
                                            <div className="text-[9px] font-black text-text-muted uppercase">EST_APY</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="border-t border-white/5 bg-[#050507] py-16 mt-20">
                <div className="max-w-[1600px] mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">
                        Aurora Intelligence Labs // Institutional DeFi Custody v6.0
                    </div>
                    <div className="flex gap-12 text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <span className="cursor-pointer hover:text-white transition-colors">Documentation</span>
                        <span className="cursor-pointer hover:text-white transition-colors">System Metrics</span>
                        <span className="cursor-pointer hover:text-white transition-colors">API Connectivity</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Security Audit</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
